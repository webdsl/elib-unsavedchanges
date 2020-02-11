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
  var trackThisForm = function() {
    var indicatorSelectorCombined = formContainerSelector + " .save-button" + (indicatorElemSelector.length ? ", " + indicatorElemSelector : "");
    indicatorElem = $(indicatorSelectorCombined);
    formContainer = $(formContainerSelector);
    form = formContainer.find('form').first();
    var newSaveBtnElem = form.find('[submitid]:not(.ignore-save-button)');
    if (newSaveBtnElem !== saveBtnElem) {
      saveBtnElem = newSaveBtnElem;
      if (saveBtnOutsideFormSelector != '') {
        saveBtnElem = saveBtnElem.add($(saveBtnOutsideFormSelector));
      }
      saveBtnElem.click(function() {
        submittedIndicatorElem = indicatorElem;
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
  }
  trackThisForm();
  var cloneSerialized = getSerialized(form);
  var checkForChanges = function() {
    modified = getSerialized(form) != cloneSerialized;
    indicatorElem.toggleClass('has-change', modified);
  }
  var timer = 0;

  //TODO: should this become part of trackThisForm, but with cleanup of event listeners? The listeners keep working so it seems, also after failing action
  form.on('keyup change paste', 'input, select, textarea', function() {
    clearTimeout(timer);
    timer = setTimeout(checkForChanges, 500);
  });

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