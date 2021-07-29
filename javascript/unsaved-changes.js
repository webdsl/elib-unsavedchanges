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
    var newSaveBtnElem = form.find('[submitid]');
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
          trackThisForm();
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
      trackedForm = form;
      trackedForm.on('keyup change paste input', 'input, select, textarea', function() {
        clearTimeout(timer);
        timer = setTimeout(checkForChanges, 500);
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
    window.onbeforeunload = function() {
      var hasChangeLen = $('.has-change').length;
      showWarning = hasChangeLen;
      if (showWarning) {
        if (submittedIndicatorElem !== undefined) {
          submittedHasChangeLen = submittedIndicatorElem.filter('.has-change').length;
          submittedIndicatorElem.removeClass('has-change');
          showWarning -= submittedHasChangeLen;
        }
      }
      if (showWarning) {
        return "You seem to have unsaved changes.";
      } else {
        return;
      }
    }
  }
}

function getSerialized( $formElem ){
	return $formElem.find(':input').not(".ignore-save-input").serialize();
}

function reportSaveActionResult(success) {
  if (reportSaveActionResultFunction !== undefined) {
    reportSaveActionResultFunction(success);
  }
}