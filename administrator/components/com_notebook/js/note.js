(function($) {
  // 
  const GETTER = {};

  // Run a function when the page is fully loaded including graphics.
  $(window).load(function() {
    //
    let rootLocation = $('#root-location').val();
    //
    let props = {'component':'notebook', 'item':'teacher', 'ordering':true, 'rootLocation':rootLocation, 'rowsCells':[5,4], 'Chosen':true};
    const teacher = new Omkod.DynamicItem(props);
    //
    GETTER.teacher = teacher;
    $('#note-form').submit( function(e) { validateFields(e); });

    let noteId = $('#jform_id').val();

    const ajax = new Omkod.Ajax();
    let params = {'method':'GET', 'dataType':'json', 'indicateFormat':true, 'async':true};
    let data = {'note_id':noteId};
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

  populateTeacherItem = function(idNb, data) {
    // Defines the default field values.
    if(data === undefined) {
      data = {'id':'', 'school_name':'', 'name':'', 'classrooms':[], 'level':'', 'certified':0, 'gender':'male'};
    }

    // Creates the hidden input element to store the attribute id.
    let attribs = {'type':'hidden', 'name':'teacher_school_id_'+idNb, 'id':'teacher-school-id-'+idNb, 'value':data.school_id};
    let elem = GETTER.teacher.createElement('input', attribs);
    $('#teacher-row-1-cell-1-'+idNb).append(elem);
    let url = $('#root-location').val()+'administrator/index.php?option=com_notebook&view=notes&layout=modal&tmpl=component&function=selectTeacherNoteItem&type=school&id_nb='+idNb;
    let button = GETTER.teacher.createButton('select', idNb, url);
    $('#teacher-row-1-cell-1-'+idNb).append(button);

    attribs = {'type':'text', 'disabled':'disabled', 'id':'teacher-school-name-'+idNb, 'value':data.school_name};
    elem = GETTER.teacher.createElement('input', attribs);
    $('#teacher-row-1-cell-2-'+idNb).append(elem);

    // Text input tag:
    attribs = {'type':'text', 'name':'teacher_name_'+idNb, 'id':'teacher-name-'+idNb, 'value':data.name};
    $('#teacher-row-1-cell-3-'+idNb).append(GETTER.teacher.createElement('input', attribs));

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

    // Checkbox tag:
    attribs = {'type':'checkbox', 'name':'teacher_certified_'+idNb, 'id':'teacher-certified-'+idNb, 'value':'certified'};

    if(data.certified == 1) {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-2-'+idNb).append(GETTER.teacher.createElement('input', attribs));

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

    // Radio buttons:
    attribs = {'type':'radio', 'name':'teacher_gender_'+idNb, 'id':'teacher-gender-'+idNb, 'value':'male'};

    if(data.gender == 'male') {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-4-'+idNb).append(GETTER.teacher.createElement('input', attribs));

    attribs = {'type':'radio', 'name':'teacher_gender_'+idNb, 'id':'teacher-gender-'+idNb, 'value':'female'};

    if(data.gender == 'female') {
      attribs.checked = 'checked';
    }

    $('#teacher-row-2-cell-4-'+idNb).append(GETTER.teacher.createElement('input', attribs));
  }

  reverseTeacherOrder = function(direction, idNb) {
    GETTER.teacher.reverseOrder(direction, idNb);
  }

  selectTeacherNoteItem = function(id, name, idNb, type) {
    GETTER.teacher.selectItem(id, name, idNb, type, true);
  }

  validateFields = function(e) {
    let task = document.getElementsByName('task');
    let fields = {'school-name':'', 'level':'', 'name':''}; 

    if(task[0].value != 'note.cancel' && !GETTER.teacher.validateFields(fields)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

})(jQuery);

