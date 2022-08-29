var onbeforeunload_set = false;

function trackFormChanges(indicatorElemSelector, formContainerSelector, saveBtnOutsideFormSelector) {
  $(document).ready(function() {
    startTrackFormChanges(indicatorElemSelector, formContainerSelector, saveBtnOutsideFormSelector)
  });
}
var reportSaveActionResultFunction, submittedIndicatorElem;

function startTrackFormChanges(indicatorElemSelector, formContainerSelector, saveBtnOutsideFormSelector) {
  var indicatorElem, formContainer, form, saveBtnElem;
  var modified = false;
  var trackedForm;
  if($(formContainerSelector).find('form').first().is('.changes-tracked')){
    return;
  };
  var trackThisForm = function() {
    var indicatorSelectorCombined = formContainerSelector + " .save-button" + (indicatorElemSelector.length ? ", " + indicatorElemSelector : "");
    indicatorElem = $(indicatorSelectorCombined);
    form = $(formContainerSelector).find('form').first();
    form.addClass("changes-tracked");
    var newSaveBtnElem = form.find('[submitid], button[name]');
    if (newSaveBtnElem !== saveBtnElem) {
      saveBtnElem = newSaveBtnElem;
      if (saveBtnOutsideFormSelector != '') {
        saveBtnElem = saveBtnElem.add($(saveBtnOutsideFormSelector));
      }
      saveBtnElem.click(function(event) {
        if(! $(event.target).is('.ignore-save-button') ){
          submittedIndicatorElem = indicatorElem;
        }

        reportSaveActionResultFunction = function(succeeded) {
          trackThisForm(); //typically the form gets replaced, so we need to track the new form for changes after action
          if (succeeded) {
            cloneSerialized = getSerialized(form);
            modified = false;
            indicatorElem.removeClass('has-change');
          } else {
            indicatorElem.toggleClass('has-change', modified);
          }
          reportSaveActionResultFunction = undefined;
          submittedIndicatorElem = undefined;
        }
      });
    }
    if( !form.is(trackedForm) ){
      if(trackedForm !== undefined){
        trackedForm.off();
      }
      trackedForm = form;
      trackedForm.on('keyup change paste input', 'input, select, textarea', function() {
        // directly update state on first change, but prevent change tracking to trigger every key press by using a 500ms delay
        var delay = modified ? 500 : 0;
        clearTimeout(timer);
        
        timer = setTimeout(checkForChanges, delay);
      });
    }
  }
  trackThisForm();
  var cloneSerialized = getSerialized(form);
  var checkForChanges = function() {
    modified = getSerialized(form) != cloneSerialized;
    indicatorElem.toggleClass('has-change', modified);
  }
  var timer = 0;

  if (!onbeforeunload_set) {
    onbeforeunload_set = true;
    window.addEventListener("beforeunload", function (e) {
      var hasChangeElems = $('.has-change');
      
      //If an action has been submitted for which the result has not been reported back (`reportSaveActionResultFunction` was not called)
      if(submittedIndicatorElem !== undefined){
        //ignore the indicator elements that were part of the submitted form
        hasChangeElems = hasChangeElems.not(submittedIndicatorElem);
      }
      
      var showWarning = hasChangeElems.length > 0;
      
      if (showWarning) {
        var message = "You seem to have unsaved changes."; 
        (e || window.event).returnValue = message;
        return message;
      } else {
        return undefined;
      }
      
    })
  }
}

function getSerialized( $formElem ){
	return $formElem.find(':input').not(".ignore-save-input, .ignore-save-input :input").serialize();
}

function reportSaveActionResult(success) {
  if (reportSaveActionResultFunction !== undefined) {
    reportSaveActionResultFunction(success);
  }
}
