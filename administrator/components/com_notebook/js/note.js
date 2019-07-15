(function($) {
  // A global variable to store then access the dynamical item objects. 
  const GETTER = {};

  // Run a function when the page is fully loaded including graphics.
  $(window).load(function() {
    // The input element containing the root location.
    let rootLocation = $('#root-location').val();
    // Sets the dynamic item properties.
    let props = {'component':'notebook', 'item':'teacher', 'ordering':true, 'rootLocation':rootLocation, 'rowsCells':[5,5], 'Chosen':true, 'nbItemsPerPage':3};

    // Stores the newly created object.
    GETTER.teacher = new Omkod.DynamicItem(props);
    // Sets the validating function. 
    $('#note-form').submit( function(e) { validateFields(e); });

    let noteId = $('#jform_id').val();

    // Prepares then run the Ajax query.
    const ajax = new Omkod.Ajax();
    let params = {'method':'GET', 'dataType':'json', 'indicateFormat':true, 'async':true};
    // Gets the form security token.
    let token = jQuery('#token').attr('name');
    // N.B: Invokes first the ajax() function in the global controller to check the token.
    let data = {[token]:1, 'task':'ajax', 'note_id':noteId};
    ajax.prepare(params, data);
    ajax.process(getAjaxResult);
  });

  getAjaxResult = function(result) {
    if(result.success === true) {
      $.each(result.data, function(i, item) { GETTER.teacher.createItem(item); });
    }
    else {
      alert('Error: '+result.message);
    }
  }

  validateFields = function(e) {
    let task = document.getElementsByName('task');
    let fields = {'school-name':'', 'level':'', 'name':''}; 

    if(task[0].value != 'note.cancel' && !GETTER.teacher.validateFields(fields)) {
      // Shows the dynamic item tab.
      $('.nav-tabs a[href="#teachers"]').tab('show');

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  /** Callback functions **/

  populateTeacherItem = function(idNb, data) {
    // Defines the default field values.
    if(data === undefined) {
      data = {'id':'', 'school_name':'', 'name':'', 'classrooms':[], 'level':'', 'certified':0, 'gender':'male', 'arrival_date':''};
    }

    // Element label.
    let attribs = {'class':'item-space', 'id':'teacher-school-label-'+idNb};
    $('#teacher-row-1-cell-1-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-school-label-'+idNb).html('&nbsp;');

    // Creates the hidden input element to store the id of the selected school item in the modal window.
    attribs = {'type':'hidden', 'name':'teacher_school_id_'+idNb, 'id':'teacher-school-id-'+idNb, 'value':data.school_id};
    let elem = GETTER.teacher.createElement('input', attribs);
    $('#teacher-row-1-cell-1-'+idNb).append(elem);
    let button = GETTER.teacher.createButton('clear', idNb);
    button.setAttribute('onclick', 'clearItemSelection(\'teacher-school-id-'+idNb+'\', \'teacher-school-name-'+idNb+'\');');
    $('#teacher-row-1-cell-1-'+idNb).append(button);
    let url = $('#root-location').val()+'administrator/index.php?option=com_notebook&view=notes&layout=modal&tmpl=component&function=selectSchoolItem&dynamic_item_type=teacher&id_nb='+idNb;
    button = GETTER.teacher.createButton('select', idNb, url);
    $('#teacher-row-1-cell-1-'+idNb).append(button);

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_SCHOOL_LABEL'), 'class':'item-label', 'id':'teacher-schoolname-label-'+idNb};
    $('#teacher-row-1-cell-2-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-schoolname-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_SCHOOL_LABEL'));

    attribs = {'type':'text', 'disabled':'disabled', 'id':'teacher-school-name-'+idNb, 'class':'selected-item-name', 'value':data.school_name};
    elem = GETTER.teacher.createElement('input', attribs);
    $('#teacher-row-1-cell-2-'+idNb).append(elem);

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_NAME_LABEL'), 'class':'item-label', 'id':'teacher-name-label-'+idNb};
    $('#teacher-row-1-cell-3-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-name-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_NAME_LABEL'));

    // Text input tag:
    attribs = {'type':'text', 'name':'teacher_name_'+idNb, 'id':'teacher-name-'+idNb, 'value':data.name};
    $('#teacher-row-1-cell-3-'+idNb).append(GETTER.teacher.createElement('input', attribs));

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_LEVEL_LABEL'), 'class':'item-label', 'id':'teacher-level-label-'+idNb};
    $('#teacher-row-2-cell-1-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-level-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_LEVEL_LABEL'));

    // Select tag:
    attribs = {'name':'teacher_level_'+idNb, 'id':'teacher-level-'+idNb};
    elem = GETTER.teacher.createElement('select', attribs);

    // Builds the select options.
    let options = '<option value="">- Select -</option>';
    for(let i = 0; i < 5; i++) {
      let value = 'lev'+ (i + 1);
      let selected = '';

      if(data.level == value) {
	selected = 'selected="selected"';
      }

      options += '<option value="'+value+'" '+selected+'>Level '+(i + 1)+'</option>';
    }

    $('#teacher-row-2-cell-1-'+idNb).append(elem);
    $('#teacher-level-'+idNb).html(options);
    // Update the chosen plugin.
    $('#teacher-level-'+idNb).chosen();

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_CERTIFIED_LABEL'), 'class':'item-label', 'id':'teacher-certified-label-'+idNb};
    $('#teacher-row-2-cell-2-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-certified-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_CERTIFIED_LABEL'));

    // Checkbox tag:
    attribs = {'type':'checkbox', 'name':'teacher_certified_'+idNb, 'id':'teacher-certified-'+idNb, 'value':'certified'};

    if(data.certified == 1) {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-2-'+idNb).append(GETTER.teacher.createElement('input', attribs));

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_CLASSROOMS_LABEL'), 'class':'item-label', 'id':'teacher-classrooms-label-'+idNb};
    $('#teacher-row-2-cell-3-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-classrooms-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_CLASSROOMS_LABEL'));

    // Multiple Select tag:
    attribs = {'name':'teacher_classrooms_'+idNb+'[]', 'id':'teacher-classrooms-'+idNb, 'multiple':'true'};
    elem = GETTER.teacher.createElement('select', attribs);

    // Builds the select options.
    options = '<option value="">- Select -</option>';
    for(let i = 0; i < 5; i++) {
      let value = 'classroom'+ (i + 1);
      let selected = '';

      if(GETTER.teacher.inArray(value, data.classrooms)) {
	selected = 'selected="selected"';
      }

      options += '<option value="'+value+'" '+selected+'>Classroom '+(i + 1)+'</option>';
    }

    $('#teacher-row-2-cell-3-'+idNb).append(elem);
    $('#teacher-classrooms-'+idNb).html(options);
    // Update the chosen plugin.
    $('#teacher-classrooms-'+idNb).chosen();

    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_GENDER_LABEL'), 'class':'item-label', 'id':'teacher-gender-label-'+idNb};
    $('#teacher-row-2-cell-4-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-gender-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_GENDER_LABEL'));

    // Radio buttons:
    attribs = {'type':'radio', 'name':'teacher_gender_'+idNb, 'id':'teacher-gender-male-'+idNb, 'value':'male'};

    if(data.gender == 'male') {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-4-'+idNb).append(GETTER.teacher.createElement('input', attribs));

    attribs = {'type':'radio', 'name':'teacher_gender_'+idNb, 'id':'teacher-gender-female-'+idNb, 'value':'female'};

    if(data.gender == 'female') {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-4-'+idNb).append(GETTER.teacher.createElement('input', attribs));


    // Element label.
    attribs = {'title':Joomla.JText._('COM_NOTEBOOK_ARRIVAL_DATE_LABEL'), 'class':'item-label', 'id':'teacher-arrival-date-label-'+idNb};
    $('#teacher-row-2-cell-5-'+idNb).append(GETTER.teacher.createElement('span', attribs));
    $('#teacher-arrival-date-label-'+idNb).text(Joomla.JText._('COM_NOTEBOOK_ARRIVAL_DATE_LABEL'));

    // Calendar field.
    GETTER.teacher.createCalendarField('arrival_date', idNb, 'teacher-row-2-cell-5-'+idNb, data.arrival_date);
  }

  reverseOrder = function(direction, idNb, dynamicItemType) {
    // Calls the parent function from the corresponding instance.
    GETTER[dynamicItemType].reverseOrder(direction, idNb);
  }

  selectSchoolItem = function(id, name, idNb, dynamicItemType) {
    // Calls the parent function from the corresponding instance.
    GETTER[dynamicItemType].selectItem(id, name, idNb, 'school', true);
  }

  browsingPages = function(pageNb, dynamicItemType) {
    // Calls the parent function from the corresponding instance.
    GETTER[dynamicItemType].updatePagination(pageNb);
  }

  beforeRemoveItem = function(idNb, dynamicItemType) {
    // Execute here possible tasks before the item deletion.
  }

  afterRemoveItem = function(idNb, dynamicItemType) {
    // Execute here possible tasks after the item deletion.
  }

  // IMPORTANT: Do not call this function "clear" or "clearSelection" as these functions
  //            already exist somewhere in the code. 
  clearItemSelection = function(valueId, nameId) {
    $('#'+valueId).val('');
    $('#'+nameId).val('');
  }

})(jQuery);

