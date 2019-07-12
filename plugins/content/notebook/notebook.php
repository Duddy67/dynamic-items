<?php
/**
 * @package Notebook
 * @copyright Copyright (c) 2018 - 2019 Lucas Sanner
 * @license GNU General Public License version 3, or later
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

JLoader::register('CalendarTrait', JPATH_ADMINISTRATOR.'/components/com_notebook/traits/calendar.php');


class plgContentNotebook extends JPlugin
{
  use CalendarTrait;

  protected $post;
  protected $jform;

  /**
   * Constructor.
   *
   * @param   object  &$subject  The object to observe
   * @param   array   $config    An optional associative array of configuration settings.
   *
   * @since   3.7.0
   */
  public function __construct(&$subject, $config)
  {
    // Loads the component language file.
    $lang = JFactory::getLanguage();
    $langTag = $lang->getTag();
    $lang->load('com_notebook', JPATH_ROOT.'/administrator/components/com_notebook', $langTag);
    // Gets the POST and jform data.
    $this->post = JFactory::getApplication()->input->post->getArray();
    $this->jform = JFactory::getApplication()->input->post->get('jform', array(), 'array');

    parent::__construct($subject, $config);
  }


  public function onContentAfterSave($context, $data, $isNew)
  {
    if($context == 'com_notebook.note' || $context == 'com_notebook.form') {
      $teachers = $values = array();

      $db = JFactory::getDbo();
      $query = $db->getQuery(true);

      $query->delete('#__notebook_teacher')
	    ->where('note_id='.(int)$data->id);
      $db->setQuery($query);
      $db->execute();

      foreach($this->post as $key => $val) {
	if(preg_match('#^teacher_name_([0-9]+)$#', $key, $matches)) {
	  $teacherNb = $matches[1];

          $schoolId = (int)$this->post['teacher_school_id_'.$teacherNb];
          $name = $this->post['teacher_name_'.$teacherNb];
          $level = $this->post['teacher_level_'.$teacherNb];
          $ordering = $this->post['teacher_ordering_'.$teacherNb];
          $certified = (int)isset($this->post['teacher_certified_'.$teacherNb]);
	  $classRooms = '[]';
          $arrivalDate = $this->post['teacher_arrival_date_'.$teacherNb];
          $gender = $this->post['teacher_gender_'.$teacherNb];

	  // Converts datetimes in UTC format.
	  $arrivalDate = $this->DateToUTC('arrival_date', $arrivalDate);

	  if(isset($this->post['teacher_classrooms_'.$teacherNb])) {
	    $classRooms = json_encode($this->post['teacher_classrooms_'.$teacherNb]);
	  }

	  $values[] = $data->id.','.$schoolId.','.$db->Quote($name).','.$db->Quote($level).','.$db->Quote($classRooms).','.$certified.','.$db->Quote($gender).','.$db->Quote($arrivalDate).','.$ordering;
	}
      }

      if(!empty($values)) {
	$columns = array('note_id', 'school_id', 'name', 'level', 'classrooms', 'certified', 'gender', 'arrival_date', 'ordering');

	$query->clear();
	$query->insert('#__notebook_teacher')
	      ->columns($columns)
	      ->values($values);
	$db->setQuery($query);
	$db->execute();
      }
    }
  }


  public function onContentAfterDelete($context, $data)
  {
    if($context == 'com_notebook.note') {
      $db = JFactory::getDbo();
      $query = $db->getQuery(true);

      $query->delete('#__notebook_teacher')
	    ->where('note_id='.(int)$data->id);
      $db->setQuery($query);
      $db->execute();
    }
  }
}

