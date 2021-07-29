module elib/elib-unsavedchanges/lib

section track form changes

/**
* Usage: For tracking changes, and updating indicator elements accordingly, call the `trackFormChanges` template with the following arguments:
*  indicatorElemSelector - the css/jquery selector for elements that will get the `has-changes` class added when there are changes. `has-changes` will be removed after save
*  formContainerSelector - the css/jquery selector of the container element that has the form in it for which to track changes
*  saveBtnOutsideFormSelector - the css/jquery selector of one or more elements that will perform a save action, but is located outside the form.
*  withPageWarning - optional boolean indicating whether or not to add a page element to be styled with fixed positioning as indicator element, which scrolls to the its parent element on click
*
* You can exclude submit button from being treated as save-action by attaching the `ignore-save-button` class to it.
* Inputs that should be ignored for unsaved-changes tracking should get the `ignore-save-input` class.
* If there are buttons that would cause the page to unload, and don't want the leave-unsaved warning displayed, add `ignore-leave-page-unsaved` class to that button
*
* Note: in order to update the form correctly after a (save) action, you need to use the `saveButtonContent` template in the elements of the submitlinks
*       -or- call the `reportSaveActionResult` template inside the form. 
*/
template trackFormChanges(indicatorElemSelector : String, formContainerSelector : String, saveBtnOutsideFormSelector : String){
  trackFormChanges(indicatorElemSelector, formContainerSelector, indicatorElemSelector, false)
}
template trackFormChanges(indicatorElemSelector : String, formContainerSelector : String, saveBtnOutsideFormSelector : String, withPageWarning : Bool){
  var combinedIndicatorSelector := indicatorElemSelector
  init{
    if(withPageWarning){
      var pageWarningSel := "#" + id;
      if(combinedIndicatorSelector != ""){
        combinedIndicatorSelector := combinedIndicatorSelector + ", " + combinedIndicatorSelector;
      } else {
        combinedIndicatorSelector :=  pageWarningSel;
      }
    }
  }
  
  <script> trackFormChanges('~combinedIndicatorSelector', '~formContainerSelector', '~saveBtnOutsideFormSelector') </script>
  includeHead( rendertemplate( postProcess( "$(node).find('.ignore-leave-page-unsaved').on('click', function(){ window.onbeforeunload = function(){}; })" ) ) )
  
  if( withPageWarning ){
    <a id=id href="javascript:void(0);" onclick="$('html, body').animate({ scrollTop: $(this).parent().offset().top}, 500);" class="unsaved-changes-page-warning">
       pageWarningElem
    </a>
  }
  
}

template pageWarningElem(){
	span[class="btn btn-xs btn-warning"]{ "You have unsaved changes"}
}
/**
* Shorthand templates when having a form (wrapped in formContainerSelector) that uses the saveButtonContent template inside action links for saving
*/
template trackFormChanges(formContainerSelector : String){ trackFormChanges("", formContainerSelector, "", false) }
template trackFormChanges(formContainerSelector : String, withPageWarning: Bool){ trackFormChanges("", formContainerSelector, "", withPageWarning) }

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
* After a (failing) action, the form gets rerendered with new elements that have no classes for unsaved-changes instrumented.
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