<?php
/**
 * @package Note Book
 * @copyright Copyright (c) 2019 - 2019 Lucas Sanner
 * @license GNU General Public License version 3, or later
 */

// No direct access to this file.
defined('_JEXEC') or die('Restricted access'); 


/**
 * Provides a set of functions allowing dynamical items to create 
 * and manage Joomla calendar fields.
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
   * Sets the button and input tag attributes of a given calendar field then places them into the 
   * html page header as Javascript code in order to be used by dynamical items.
   *
   * @param   string  $fieldName    The calendar field name to set. 
   *
   * @return  boolean               True if successful, false otherwise. 
   */
  public function setCalendarField($fieldName)
  {
    return $this->setCalendarFields(array($fieldName));
  }


  /**
   * Sets the button and input tag attributes of the given calendar fields then places them into the 
   * html page header as Javascript code in order to be used by dynamical items.
   *
   * N.B: The settings is based on the layouts/joomla/form/field/calendar.php file.
   *
   * @param   array   $fieldNames   An array of field names to set. 
   *
   * @return  boolean               True if successful, false otherwise. 
   */
  public function setCalendarFields($fieldNames)
  {
    // Gets the calendar ini file.
    $calendarFields = $this->getCalendarFields();
    $app = JFactory::getApplication();

    // Checks for error.
    if(empty($calendarFields)) {
      $app->enqueueMessage(JText::_('COM_NOTEBOOK_ERROR_INI_FILE_NOT_FOUND'), 'error');
      return false;
    }

    $skip = array('format', 'filter', 'readonly', 'disabled', 'class');

    $js = array();
    // Create a name space in order put objects into it.
    $js = 'var notebookCalendar = { '."\n";

    foreach($fieldNames as $fieldName) {
      $field = @$calendarFields[$fieldName];

      // Checks for error.
      if($field === null) {
	$app->enqueueMessage(JText::sprintf('COM_NOTEBOOK_ERROR_CALENDAR_FIELD_DO_NOT_EXIST', $fieldName), 'error');
	return false;
      }

      // Stores the input tag attributes.
      $input = array('readonly' => $field['readonly'], 'disabled' => $field['disabled'],  'class' => $field['class']);

      foreach($field as $key => $value) {
        // Removes the attributes not used with the button tag.
	if(in_array($key, $skip) || ($key == 'minyear' && (int)$value == 0) || ($key == 'maxyear' && (int)$value == 0)) {
	  unset($field[$key]);
	}
      }

      // Sets the day format.
      if(!isset($field['dayformat']) && $field['translateformat']) {
	if($field['showtime']) {
	  $format = JText::_('DATE_FORMAT_CALENDAR_DATETIME');
	}
	else {
	  $format = JText::_('DATE_FORMAT_CALENDAR_DATE');
	}

	$field['dayformat'] = $format;
      }

      // Sets the attributes needed for the button tag then removes the unnecessary
      // array elements.

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

      unset($field['translateformat']);

      // Stores the button and input tag attributes as a Javascript object.
      $js .= $fieldName.': { button: '.json_encode($field).', input: '.json_encode($input).'},'."\n";
    }

    // Removes coma from the end of the string, (-2 due to the carriage return "\n").
    $js = substr($js, 0, -2);
    $js .= '};'."\n\n";

    // Places the Javascript code into the html page header.
    $doc = JFactory::getDocument();
    $doc->addScriptDeclaration($js);

    return true;
  }


  /**
   * Convert a UTC date in a local date  and translates the datime format as well, (according to 
   * the calendar field settings).
   *
   * N.B: This code is based on the getInput() function in libraries/joomla/form/fields/calendar.php.
   *
   * @param   string  $fieldName  The name of the calendar field.
   * @param   string  $value      The UTC date to convert.
   *
   * @return  string              The given date converted in local.
   */
  public function UTCToDate($fieldName, $value)
  {
    // Gets the calendar ini file.
    $calendarFields = $this->getCalendarFields();
    // Gets the given field.
    $field = $calendarFields[$fieldName];

    if($field['translateformat']) {
      $format = ($field['showtime']) ? JText::_('DATE_FORMAT_CALENDAR_DATETIME') : JText::_('DATE_FORMAT_CALENDAR_DATE');
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
	$date->setTimezone(JFactory::getUser()->getTimezone());

	// Transform the date string.
	$value = $date->format('Y-m-d H:i:s', true, false);
      }
    }

    // Format value when not nulldate ('0000-00-00 00:00:00'), otherwise blank it as it would result in 1970-01-01.
    if($value && $value != JFactory::getDbo()->getNullDate() && strtotime($value) !== false) {
      $tz = date_default_timezone_get();
      date_default_timezone_set('UTC');
      $value = strftime($format, strtotime($value));
      date_default_timezone_set($tz);
    }
    else {
      $value = '';
    }

    return $value;
  }


  /**
   * Convert a local date to a UTC date and translates the datime format as well, (according to 
   * the calendar field settings). 
   *
   * N.B: This code is based on the filterField() function in libraries/src/Form/Form.php
   *
   * @param   string  $fieldName  The name of the calendar field.
   * @param   string  $value      The local date to convert.
   *
   * @return  string              The given date converted in UTC.
   */
  public function DateToUTC($fieldName, $value)
  {
    // Gets the calendar ini file.
    $calendarFields = $this->getCalendarFields();
    // Gets the given field.
    $field = $calendarFields[$fieldName];

    if(empty($value) || $value == JFactory::getDbo()->getNullDate()) {
      return JFactory::getDbo()->getNullDate();
    }

    if($field['translateformat']) {
      $format = ($field['showtime']) ? JText::_('DATE_FORMAT_FILTER_DATETIME') : JText::_('DATE_FORMAT_FILTER_DATE');

      $date = date_parse_from_format($format, $value);
      $value = (int)$date['year'].'-'.(int)$date['month'].'-'.(int)$date['day'];

      if($field['showtime']) {
	$value .= ' '.(int)$date['hour'].':'.(int)$date['minute'].':'.(int)$date['second'];
      }
    }

    // Sets the default offset to UTC (in case no filter is set). 
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
