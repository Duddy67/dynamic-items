<?php
/**
 * @package Note Book
 * @copyright Copyright (c) 2017 - 2019 Lucas Sanner
 * @license GNU General Public License version 3, or later
 */

defined('_JEXEC') or die('Restricted access'); // No direct access to this file.


class NotebookHelper
{
  //Create the tabs bar ($viewName = name of the active view).
  public static function addSubmenu($viewName)
  {
    JHtmlSidebar::addEntry(JText::_('COM_NOTEBOOK_SUBMENU_NOTES'),
				      'index.php?option=com_notebook&view=notes', $viewName == 'notes');

    JHtmlSidebar::addEntry(JText::_('COM_NOTEBOOK_SUBMENU_CATEGORIES'),
				      'index.php?option=com_categories&extension=com_notebook', $viewName == 'categories');

    if($viewName == 'categories') {
      $document = JFactory::getDocument();
      $document->setTitle(JText::_('COM_NOTEBOOK_ADMINISTRATION_CATEGORIES'));
    }
  }


  //Get the list of the allowed actions for the user.
  public static function getActions($catIds = array())
  {
    $user = JFactory::getUser();
    $result = new JObject;

    $actions = array('core.admin', 'core.manage', 'core.create', 'core.edit',
		     'core.edit.own', 'core.edit.state', 'core.delete');

    //Get from the core the user's permission for each action.
    foreach($actions as $action) {
      //Check permissions against the component. 
      if(empty($catIds)) { 
	$result->set($action, $user->authorise($action, 'com_notebook'));
      }
      else {
	//Check permissions against the component categories.
	foreach($catIds as $catId) {
	  if($user->authorise($action, 'com_notebook.category.'.$catId)) {
	    $result->set($action, $user->authorise($action, 'com_notebook.category.'.$catId));
	    break;
	  }

	  $result->set($action, $user->authorise($action, 'com_notebook.category.'.$catId));
	}
      }
    }

    return $result;
  }

  //Build the user list for the filter.
  public static function getUsers($itemName)
  {
    // Create a new query object.
    $db = JFactory::getDbo();
    $query = $db->getQuery(true);
    $query->select('u.id AS value, u.name AS text');
    $query->from('#__users AS u');
    //Get only the names of users who have created items, this avoids to
    //display all of the users in the drop down list.
    $query->join('INNER', '#__notebook_'.$itemName.' AS i ON i.created_by = u.id');
    $query->group('u.id');
    $query->order('u.name');

    // Setup the query
    $db->setQuery($query);

    // Return the result
    return $db->loadObjectList();
  }

  public static function setJavascriptText()
  {
    JText::script('COM_NOTEBOOK_BUTTON_ADD_LABEL');
    JText::script('COM_NOTEBOOK_BUTTON_SELECT_LABEL');
    JText::script('COM_NOTEBOOK_BUTTON_REMOVE_LABEL');
    JText::script('COM_NOTEBOOK_REMOVE_DYNAMIC_ITEM');
    JText::script('COM_NOTEBOOK_ALERT_MANDATORY_FIELD');
    JText::script('COM_NOTEBOOK_ALERT_VALUE_TYPE_NOT_VALID');

    return;
  }
}


