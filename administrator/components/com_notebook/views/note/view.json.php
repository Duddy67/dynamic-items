<?php
/**
 * @package Note Book
 * @copyright Copyright (c) 2016 - 2017 Lucas Sanner
 * @license GNU General Public License version 3, or later
 */
defined( '_JEXEC' ) or die; // No direct access
 
/**
 * JSON Note View class. Mainly used for Ajax request. 
 */
class NotebookViewNote extends JViewLegacy
{
  public function display($tpl = null)
  {
    $jinput = JFactory::getApplication()->input;
    //Collects the required variables.
    $noteId = $jinput->get('note_id', 0, 'uint');
    $model = $this->getModel();
    $results = array();
    $results = $model->getTeacher($noteId);
    //file_put_contents('debog_file.txt', print_r($results, true)); 
    echo new JResponseJson($results);
  }
}

