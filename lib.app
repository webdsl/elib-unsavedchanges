module elib/elib-unsavedchanges/lib

section trackFormChanges

  /** 
  * Usage: For tracking changes, and updating indicator elements accordingly, call the `trackFormChanges` template with the following arguments:
  *  indicatorElemSelector - the css/jquery selector for elements that will get the `has-changes` class added when there are changes. `has-changes` will be removed after save
  *  formContainerSelector - the css/jquery selector of the form for which to track changes
  *  saveBtnSelector       - the css/jquery selector of the elements that will perform the save action. These elements also get the `has-changes` class
  */
  template trackFormChanges(indicatorElemSelector : String, formContainerSelector : String, saveBtnSelector : String){
     <script> trackFormChanges('~indicatorElemSelector', '~formContainerSelector', '~saveBtnSelector') </script>
  }
  /**
  * Shorthand template when having a form (wrapped in formContainerSelector) that uses the saveButtonContent template inside action links for saving
  *
  */
  template trackFormChanges(formContainerSelector : String){
    trackFormChanges(formContainerSelector + " .save-button", formContainerSelector, formContainerSelector + " .save-button")
  }
  
  template unsavedchangesIncludes( withCSS : Bool ){
    includeJS( IncludePaths.jQueryJS() )
  	includeJS("unsaved-changes.js")
  	if(withCSS){
  		includeCSS("unsaved-changes.css")
  	}
  }
  
section save button

/*
 * save button for submitlinks that responds to changes when using the '.save-button' selector
 * e.g. submitlink save(){ saveButtonContent }
 */

template saveButtonContent(){
  saveButtonContentCustom( { saveButton_unsavedDefaultElements "" } )[all attributes]{
    saveButton_savedDefaultElements
  }
}

template saveButtonContentCustom(unsavedChangesElements : TemplateElements){
  saveButton_savedSpan[all attributes]{
    elements
  }
  saveButton_unsavedSpan[all attributes]{
    unsavedChangesElements
  }
}

//templates to override - start -- Override these templates if default style (bootstrap) does not match the app style 
template saveButton_unsavedDefaultElements(){
	span[class="glyphicon glyphicon-floppy-disk"] " Save"
}
template saveButton_savedDefaultElements(){
  span[class="glyphicon glyphicon-floppy-disk-saved"] " Saved"
}
template saveButton_unsavedSpan(){
  span[class:="save-button unsaved btn btn-warning", all attributes]{
    elements
  }
}
template saveButton_savedSpan(){
	span[class:="save-button saved btn btn-success", all attributes]{
		elements
	}
}
//templates to override - end