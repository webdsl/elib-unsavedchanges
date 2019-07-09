module elib/elib-unsavedchanges/lib

section track form changes

/**
* Usage: For tracking changes, and updating indicator elements accordingly, call the `trackFormChanges` template with the following arguments:
*  indicatorElemSelector - the css/jquery selector for elements that will get the `has-changes` class added when there are changes. `has-changes` will be removed after save
*  formContainerSelector - the css/jquery selector of the container element that has the form in it for which to track changes
*  saveBtnSelector       - the css/jquery selector of the elements that will perform the save action. These elements also get the `has-changes` class
*
* Note: in order to update the form correctly after a (save) action, you need to use the `saveButtonContent` template in the elements of the submitlinks
*       -or- call the `reportSaveActionResult` template inside the form. 
*/
template trackFormChanges(indicatorElemSelector : String, formContainerSelector : String, saveBtnSelector : String){
  <script> trackFormChanges('~indicatorElemSelector', '~formContainerSelector', '~saveBtnSelector') </script>
}

/**
* Shorthand template when having a form (wrapped in formContainerSelector) that uses the saveButtonContent template inside action links for saving*
*/
template trackFormChanges(formContainerSelector : String){
  trackFormChanges("", formContainerSelector, "")
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
    
  reportSaveActionResult
}
/**
* This reports the action result back to the tracker.
* After an (failing) test, the form gets rerendered with new elements that have no classes for unsaved-changes instrumented.
* Especially when an action fails (i.e. when changes are not saved), the class used for unsaved changes should get re-applied,
* and events be rebound to the newly rendered elements, which is what the `reportSaveActionResultFunction` does
*/  
template reportSaveActionResult(){
  <script>reportSaveActionResult( ~(!getPage().isTransactionAborted()) );</script>
}
function reportSaveActionResult(){
  runscript("reportSaveActionResult( ~(!getPage().isTransactionAborted()) )");
}

//templates to override - start -- Override these templates if default style (bootstrap) does not match the app style
template saveButton_unsavedDefaultElements(){
  span[class="glyphicon glyphicon-floppy-disk"] " Save"
}
template saveButton_savedDefaultElements(){
  span[class="glyphicon glyphicon-floppy-saved"] " Saved"
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

section native java for checking action handling

native class utils.AbstractPageServlet as PageServlet{
   isTransactionAborted() : Bool
}