<?php
/**
 * @package Note Book
 * @copyright Copyright (c) 2019 - 2019 Lucas Sanner
 * @license GNU General Public License version 3, or later
 */

// No direct access to this file.
defined('_JEXEC') or die('Restricted access'); 


/**
 * Provides some utility functions relating to items linked to a product as attributes,
 * images and so on. 
 *
 */

trait CalendarTrait
{
  /**
   * Returns the calendar field data set in an .ini file 
   *
   * @return  Array    An associative array of calendar field data. 
   *                   An empty array in case of failure.
   */
  public function getCalendarFields()
  {
    // Do not display message in case of error. Just return an empty array. 
    if(!$calendarFields = @parse_ini_file(JPATH_ADMINISTRATOR.'/components/com_notebook/js/calendar-fields.ini', true)) {
      return array();
    }

    return $calendarFields;
  }


  /**
   * Returns the calendar field names set in an .ini file 
   *
   * @return  Array    An array of calendar field name. 
   *                   An empty array in case of failure.
   */
  public function getCalendarFieldNames()
  {
    // Gets the calendar ini file.
    $calendarFields = $this->getCalendarFields();

    if(!empty($calendarFields)) {
      $fieldNames = array();

      // Stores the calendar field names set in the ini file into brackets (eg: [birth_date]).
      foreach($calendarFields as $fieldName => $fieldValues) {
	$fieldNames[] = $fieldName;
      }

      return $fieldNames;
    }

    return $calendarFields;
  }


  /**
   * Sets the attributes of the given calendar fields then places it into the html page header
   * as Javascript code in order to be used by dynamical items.
   *
   * N.B: The settings is based on the layouts/joomla/form/field/calendar.php file.
   *
   * @param   array   $fieldNames   An array of field names to set. 
   *
   * @return  void
   */
  public function setCalendarFields($fieldNames)
  {
    // Gets the calendar ini file.
    $calendarFields = $this->getCalendarFields();

    $skip = array('format', 'filter', 'readonly', 'disabled', 'class');

    $js = array();
    // Create a name space in order put objects into it.
    $js = 'var notebookCalendar = { '."\n";

    foreach($fieldNames as $fieldName) {
      $field = $calendarFields[$fieldName];
      // Stores the input attributes.
      $input = array('readonly' => $field['readonly'], 'disabled' => $field['disabled'],  'class' => $field['class']);

      foreach($field as $key => $value) {
        // Removes the attributes not used with the button tag.
	if(in_array($key, $skip) || ($key == 'minyear' && (int)$value == 0) || ($key == 'maxyear' && (int)$value == 0)) {
	  unset($field[$key]);
	}
      }

      if(!isset($field['dayformat']) && $field['translateformat']) {

	if($field['showtime']) {
	  $format = JText::_('DATE_FORMAT_CALENDAR_DATETIME');
	}
	else {
	  $format = JText::_('DATE_FORMAT_CALENDAR_DATE');
	}

	$field['dayformat'] = $format;
      }

      unset($field['translateformat']);

      if(!isset($field['firstday'])) {
	$field['firstday'] = JFactory::getLanguage()->getFirstDay();
      }

      if(!isset($field['weekend'])) {
	$field['weekend'] = JFactory::getLanguage()->getWeekEnd();
      }

      $field['only-month-nav'] = (int)$field['singleheader'];
      unset($field['singleheader']);

      $field['today-btn'] = (int)$field['todaybutton'];
      unset($field['todaybutton']);

      $field['time-24'] = (int)$field['timeformat'];
      unset($field['timeformat']);

      $field['show-time'] = (int)$field['showtime'];
      unset($field['showtime']);

      $field['week-numbers'] = (int)$field['weeknumbers'];
      unset($field['weeknumbers']);

      $field['show-others'] = (int)$field['filltable'];
      unset($field['filltable']);

      $js .= $fieldName.': { button: '.json_encode($field).', input: '.json_encode($input).'},'."\n";
    }

    // Removes coma from the end of the string, (-2 due to the carriage return "\n").
    $js = substr($js, 0, -2);
    $js .= '};'."\n\n";

    // Places the Javascript code into the html page header.
    $doc = JFactory::getDocument();
    $doc->addScriptDeclaration($js);
  }


  /**
   * Returns a Table object, always creating it.
   *
   * @param   string  $type    The table type to instantiate
   * @param   string  $prefix  A prefix for the table class name. Optional.
   * @param   array   $config  Configuration array for model. Optional.
   *
   * @return  JTable    A database object
   */
  public function UTCToDate($fieldName, $value)
  {
    $calendarFields = $this->getCalendarFields();
    $field = $calendarFields[$fieldName];

    if($field['translateformat']) {
      $format = ($field['showtime']) ? JText::_('DATE_FORMAT_FILTER_DATETIME') : JText::_('DATE_FORMAT_FILTER_DATE');
    }

    if($field['filter'] == 'server_utc') {
      // Convert a date to UTC based on the server timezone.
      if($value && $value != JFactory::getDbo()->getNullDate()) {
	// Get a date object based on the correct timezone.
	$date = JFactory::getDate($value, 'UTC');
	$date->setTimezone(new DateTimeZone($config->get('offset')));

	// Transform the date string.
	$value = $date->format('Y-m-d H:i:s', true, false);
      }
    }
    elseif($field['filter'] == 'user_utc') {
      // Convert a date to UTC based on the user timezone.
      if($value && $value != JFactory::getDbo()->getNullDate()) {
	// Get a date object based on the correct timezone.
	$date = JFactory::getDate($value, 'UTC');
	$date->setTimezone($user->getTimezone());

	// Transform the date string.
	$value = $date->format('Y-m-d H:i:s', true, false);
      }
    }

    // Format value when not nulldate ('0000-00-00 00:00:00'), otherwise blank it as it would result in 1970-01-01.
    if($value && $value != JFactory::getDbo()->getNullDate() && strtotime($value) !== false) {
      $tz = date_default_timezone_get();
      date_default_timezone_set('UTC');
      $value = strftime($this->format, strtotime($value));
      date_default_timezone_set($tz);
    }
    else {
      $value = '';
    }

    return $value;
  }


  public function DateToUTC($fieldName, $value)
  {
    $calendarFields = $this->getCalendarFields();
    $field = $calendarFields[$fieldName];

    if($field['translateformat']) {
      $format = ($field['showtime']) ? JText::_('DATE_FORMAT_FILTER_DATETIME') : JText::_('DATE_FORMAT_FILTER_DATE');

      $date = date_parse_from_format($format, $value);
      $value = (int)$date['year'].'-'.(int)$date['month'].'-'.(int)$date['day'];

      if($field['showtime']) {
	$value .= ' '.(int)$date['hour'].':'.(int)$date['minute'].':'.(int)$date['second'];
      }
    }

    $offset = 'UTC';

    // Convert a date to UTC based on the server timezone offset.
    if($field['filter'] == 'server_utc') {
      // Get the server timezone setting.
      $offset = JFactory::getConfig()->get('offset');
    }
    // Convert a date to UTC based on the user timezone offset.
    elseif($field['filter'] == 'user_utc') {
      // Get the user timezone setting defaulting to the server timezone setting.
      $offset = JFactory::getUser()->getTimezone();
    }

    return JFactory::getDate($value, $offset)->toSql();
  }
}
