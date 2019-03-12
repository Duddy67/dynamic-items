
Omkod.DynamicItem = class {
  constructor(props) {
    // Sets the item properties.
    this.componentName = props.component;
    this.itemType = props.item;
    this.itemTypeUpperCase = this.itemType.slice(0,1).toUpperCase() + this.itemType.slice(1);
    this.ordering = props.ordering;
    this.rowsCells = props.rowsCells;
    this.rootLocation = props.rootLocation;
    // Initializes some utility variables
    this.idNbList = [];
    this.removedIdNbs = [];

    // Creates the item container as well as the add button container.
    let attribs = {'id':this.itemType+'-container', 'class':this.itemType+'-container'};
    this.container = this.createElement('div', attribs);
    attribs = {'id':'add-button-container', 'class':'add-button-container'};
    this.addButtonContainer = this.createElement('div', attribs);

    // Adds both the div and add button containers to the DOM. 
    document.getElementById(this.itemType).appendChild(this.container); 
    document.getElementById(this.itemType+'-container').appendChild(this.addButtonContainer); 
    // Inserts the add button.
    let button = this.createButton('add');
    this.addButtonContainer.appendChild(button);

    return this;
  }

  /**
   * Creates a button then binds it to a function according to the action.
   *
   * @param   string  action The action that the button triggers.
   * @param   integer idNb   The item id number (for remove action).
   * @param   string  modal  The url to the modal window (for select action).
   *
   * @return  object         The created button.
  */
  createButton(action, idNb, modal) {
    // Creates a basic button.
    let label = Joomla.JText._('COM_'+this.componentName.toUpperCase()+'_BUTTON_'+action.toUpperCase()+'_LABEL');
    let attribs = {'class':'btn', 'title':label};
    let button = this.createElement('button', attribs);
    let classes = {'add':'btn-primary', 'remove':'btn-danger', 'select':'btn-info'};
    let icons = {'add':'plus-2', 'remove':'remove', 'select':'list'};

    if(action == 'add') {
      button.addEventListener('click', (e) => { e.preventDefault(); this.createItem(); } );
    }

    if(action == 'remove') {
      button.addEventListener('click', (e) => { e.preventDefault(); this.removeItem(idNb); } );
    }

    if(action == 'select') {
      button.addEventListener('click', (e) => { e.preventDefault(); SqueezeBox.open(modal, {handler: 'iframe', size: {x: 800, y: 530}}); } );
    }

    button.classList.add(classes[action]);
    button.innerHTML = '<span class="icon-'+icons[action]+' icon-white"></span> '+label;

    return button;
  }

  /**
   * Creates a basic item of the given type. A callback function (named after the item type) is called afterward. 
   *
   * @param   object  data   The data to set the item to.
   *
   * @return  void
  */
  createItem(data) {
    // Sets the id number for the item.
    let idNb = null;
    if(data !== undefined && data.id_nb !== undefined) {
      // Uses the given id number.
      idNb = data.id_nb;
    }
    else {
      // Gets a brand new id number for the item.
      idNb = this.getNewIdNumber();
    }

    // Creates the item div then its inner structure.
    let attribs = {'id':this.itemType+'-item-'+idNb, 'class':this.itemType+'-item'};
    let item = this.createElement('div', attribs);
    this.container.appendChild(item);
    this.createItemStructure(item, idNb);

    if(this.ordering) {
      // Note: No need to add the new item id number to the list as it is updated 
      //       in the itemReordering function.
      this.setItemOrdering(idNb);
    }
    else {
      // Adds the new item id number to the list.
      this.idNbList.push(idNb);
    }

    // Concatenates the callback function name.
    let callback = 'populate'+this.itemTypeUpperCase+'Item';
    // Calls the callback function to add the specific elements to the item.
    window[callback](idNb, data);
  }

  /**
   * Creates the inner structure of the item (ie: a set of divs structured in rows and
   * cells). A Remove button is added in the last cell of the first row.
   *
   * @param   object  item   The item.
   * @param   integer idNb   The item id number.
   *
   * @return  void
  */
  createItemStructure(item, idNb) {
    // Note: row number = the rowsCells array indexes. 
    //       cell number = the rowsCells array values.
    for(let i = 0; i < this.rowsCells.length; i++) {
      let rowNb = i + 1;
      let cellNb = 0;

      for(let j = 0; j < this.rowsCells[i]; j++) {
	cellNb = j + 1;
	let attribs = {'id':this.itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb, 'class':this.itemType+'-cells-row-'+rowNb};
	item.appendChild(this.createElement('div', attribs));
      }

      // Adds a button which removes the item.
      if(rowNb == 1) {
	document.getElementById(this.itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb).appendChild(this.createButton('remove', idNb)); 
      }

      // Adds a separator for multiple row structures.
      if(rowNb < this.rowsCells.length) {
	item.appendChild(this.createElement('span', {'class':this.itemType+'-row-separator'}));
      }
    }
  }

  /**
   * Removes the item corresponding to the given id number.
   *
   * @param   string   idNb   The id number of the item to remove.
   *
   * @return  void
  */
  removeItem(idNb) {
    // Asks the user to confirm deletion.
    if(confirm(Joomla.JText._('COM_'+this.componentName.toUpperCase()+'_REMOVE_DYNAMIC_ITEM')) === false) {
      return;
    }

    // Removes the item from its div id.
    this.container.removeChild(document.getElementById(this.itemType+'-item-'+idNb));
    // Stores the removed id number.
    this.removedIdNbs.push(idNb);

    if(this.ordering) {
      // Note: No need to remove the item id number from the list as it is updated 
      //       in the itemReordering function.
      this.itemReordering();
    }
    else {
      // Removes the item id number from the list.
      for(let i = 0; i < this.idNbList.length; i++) { 
	if(this.idNbList[i] == idNb) {
	  this.idNbList.splice(i, 1); 
	}
      }
    }
  }

  /**
   * Creates an HTML element of the given type.
   *
   * @param   string   type        The type of the element.
   * @param   object   attributes  The element attributes.
   *
   * @return  object   The HTML element.
  */
  createElement(type, attributes) {
    let element = document.createElement(type);
    // Sets the element attributes (if any).
    if(attributes !== undefined) {
      for(let key in attributes) {
	// Ensures that key is not a method/function.
	if(typeof attributes[key] !== 'function') {
	  element.setAttribute(key, attributes[key]);
	}
      }
    }

    return element;
  }

  /**
   * Computes a new item id number according to the item divs which are already in the
   * container as well as those recently removed.
   *
   * @return  integer   The new id number.
  */
  getNewIdNumber() {
    let newIdNb = 0;
    // Loops through the id number list.
    for(let i = 0; i < this.idNbList.length; i++) {
      // If the item id number is greater than the new one, we use it.
      if(this.idNbList[i] > newIdNb) {
	newIdNb = this.idNbList[i];
      }
    }

    // Checks against the recently removed items.
    for(let i = 0; i < this.removedIdNbs.length; i++) {
      if(this.removedIdNbs[i] > newIdNb) {
	newIdNb = this.removedIdNbs[i];
      }
    }

    // Returns a valid id number (ie: the highest id number in the container plus 1).
    return newIdNb + 1;
  }

  /**
   * Generic function called by a modal child window when an item is 
   * selected (clicked) into its list.
   *
   * @param   integer id     The id of the selected item.
   * @param   string  name   The name of the selected item.
   * @param   integer idNb   The id number of the dynamic item.
   * @param   string  type   The type of the selected item.
   * @param   boolean close  If true the child window is closed.
   *
   * @return  void
  */
  selectItem(id, name, idNb, type, close) {
    let item = document.getElementById(this.itemType+'-'+type+'-id-'+idNb);
    if(item.value != id) {
      item.value = id;
      document.getElementById(this.itemType+'-'+type+'-name-'+idNb).value = name;
    }

    if(close) {
      SqueezeBox.close();
    }
  }

  /**
   * Updates the order value of the items according to their position into the item
   * container.
   *
   * @return  void
  */
  itemReordering() {
    // Collects all the item divs (ie: with a itemtype-item class) in the container.
    let divs = this.container.querySelectorAll('div.'+this.itemType+'-item');
    // Empties the id number list.
    this.idNbList = [];

    // Loops through the item divs.
    for(let i = 0; i < divs.length; i++) {
      let order = i + 1; 
      // Extracts the id number of the item from the end of its id value and convert it into an integer.
      let idNb = parseInt(divs[i].id.replace(/.+-(\d+)$/, '$1'));
      // Updates the order of the id number. 
      this.idNbList.push(idNb);

      // Updates the item order.
      document.getElementById(this.itemType+'-order-'+idNb).value = order;
      document.getElementById(this.itemType+'-ordering-'+idNb).value = order;
      // Displays the up/down links of the item. 
      document.getElementById(this.itemType+'-up-ordering-'+idNb).style.display = 'inline';
      document.getElementById(this.itemType+'-down-ordering-'+idNb).style.display = 'inline';
      // Resets first and last item classes.
      document.getElementById(this.itemType+'-ordering-'+idNb).classList.remove('first-item', 'last-item');

      if(order == 1) {
	// The first item cannot go any higher.
	document.getElementById(this.itemType+'-up-ordering-'+idNb).style.display = 'none';
	document.getElementById(this.itemType+'-ordering-'+idNb).classList.add('first-item');
      }

      if(order == divs.length) {
	// The last item cannot go any lower.
	document.getElementById(this.itemType+'-down-ordering-'+idNb).style.display = 'none';
	document.getElementById(this.itemType+'-ordering-'+idNb).classList.add('last-item');
      }
    }
  }

  /**
   * Inserts an ordering functionality in the given item. This functionality allows the
   * item to go up or down into the item ordering.
   *
   * @param   integer idNb   The id number of the item.
   *
   * @return  void
  */
  setItemOrdering(idNb) {
    // The ordering tags are always inserted in the penultimate cell of the first row.
    let row = 1;
    let cell = this.rowsCells[0] - 1; 

    // Creates the element in which the item order number is stored.
    let attribs = {'type':'hidden', 'name':this.itemType+'_order_'+idNb, 'id':this.itemType+'-order-'+idNb};
    document.getElementById(this.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('input', attribs));

    // Concatenates the function name allowing the item to go up or down in the item ordering. 
    let functionName = 'reverse'+this.itemTypeUpperCase+'Order';
    // Creates the link allowing the item to go down the item ordering.
    attribs = {'href':'#', 'id':this.itemType+'-down-ordering-'+idNb, 'onclick':functionName+'(\'down\','+idNb+')', 'class':'down-ordering'};
    let link = this.createElement('a', attribs);
    attribs = {'src':this.rootLocation+'media/com_'+this.componentName+'/images/arrow_down.png', 'title':'arrow down', 'height':16, 'width':16};
    link.appendChild(this.createElement('img', attribs));
    document.getElementById(this.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(link);

    // Creates fake element to display the order number. 
    attribs = {'type':'text', 'disabled':'disabled', 'id':this.itemType+'-ordering-'+idNb, 'class':this.itemType+'-ordering'};
    document.getElementById(this.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('input', attribs));
 
    // Creates the link allowing the item to go up the item ordering.
    attribs = {'href':'#', 'id':this.itemType+'-up-ordering-'+idNb, 'onclick':functionName+'(\'up\','+idNb+')', 'class':'up-ordering'};
    link = this.createElement('a', attribs);
    attribs = {'src':this.rootLocation+'media/com_'+this.componentName+'/images/arrow_up.png', 'title':'arrow up', 'height':16, 'width':16};
    link.appendChild(this.createElement('img', attribs));
    document.getElementById(this.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(link);

    this.itemReordering();
  }

  /**
   * Switches the order of 2 items in the DOM. 
   *
   * @param   string  direction  The direction to go when switching (up/down).
   * @param   integer idNb       The id number of the item to switch from.
   *
   * @return  void
  */
  reverseOrder(direction, idNb) {
    // Loops through the item id number order.
    for(let i = 0; i < this.idNbList.length; i++) {
     // Checks for the item which order has to be reversed.
     if(this.idNbList[i] == idNb) {
       // Sets the item indexes according to the direction.
       let index1 = i;
       let index2 = i + 1;

       if(direction == 'up') {
	 index1 = i - 1;
	 index2 = i;
       }

       // Gets the reference item before which the other item will be inserted.
       let refItem = document.getElementById(this.itemType+'-item-'+this.idNbList[index1]);
       // Momentarily withdraws the other item from the DOM.
       let oldChild = this.container.removeChild(document.getElementById(this.itemType+'-item-'+this.idNbList[index2]));
       // Switches the 2 items.
       this.container.insertBefore(oldChild, refItem);
       break;
     }
    }

    this.itemReordering();
  }

  /**
   * Checks the item field values.
   *
   * @param   object  fields       The name of the fields to check (ie: the mandatory fields). The field names are stored in the 
   *                               object keys (eg 'firstname':'', 'lastname':'', ...).
   *                               Optional: A value type to check can be set in the value (eg: 'age':'int')
   * @param   object  extraType    A specific type to check. Object structure: {'type name':'regex to use'}
   *
   * @return  boolean              True if all fields are ok, else otherwise.
  */
  validateFields(fields, extraType) {
    // Loops through the item id numbers.
    for(let i = 0; i < this.idNbList.length; i++) {
      // Checks the given fields for each item.
      for(let key in fields) {
	let field = document.getElementById(this.itemType+'-'+key+'-'+this.idNbList[i]);
	// In case the field was previously not valid.
	field.classList.remove('mandatory');
	// Removes possible whitespace from both sides of the string.
	let value = field.value.trim();

	// Checks for empty fields.
	if(value == '') {
	  field.classList.add('mandatory');
          alert(Joomla.JText._('COM_'+this.componentName.toUpperCase()+'_ALERT_MANDATORY_FIELD'));
	  return false;
	}

	// Checks the value type.
	if(fields[key] !== '' && !this.checkValueType(value, fields[key], extraType)) {
	  field.classList.add('mandatory');
          alert(Joomla.JText._('COM_'+this.componentName.toUpperCase()+'_ALERT_VALUE_TYPE_NOT_VALID'));
	  return false;
	}
      }
    }

    return true;
  }

  /**
   * Checks the type of the given value.
   *
   * @param   string  value      The value to check.
   * @param   string  valueType  The type to check the value against.
   * @param   object  extraType  A specific type to check. Object structure: {'type name':'regex to use'}
   *
   * @return  boolean            True if the value matches the type, else otherwise.
  */
  checkValueType(value, valueType, extraType) {
    let regex = '';
    // Checks first for extra type.
    if(extraType !== undefined && valueType == extraType.valueType) {
      regex = extraType.regex;
      return regex.test(value);
    }

    switch(valueType) {
      case 'string':
	regex = /^.+$/;
	break;

      case 'int':
	regex = /^-?[0-9]+$/;
	break;

      case 'unsigned_int':
	regex = /^[0-9]+$/;
	break;

      case 'float':
	regex = /^-?[0-9]+(\.[0-9]+)?$/;
	break;

      case 'unsigned_float':
	regex = /^[0-9]+(\.[0-9]+)?$/;
	break;

      default: // Unknown type.
	return false;
    }

    return regex.test(value);
  }
}
