var onbeforeunload_set = false;
function trackFormChanges( indicatorElemSelector, formContainerSelector, saveBtnSelector ){
  $(document).ready( function(){ startTrackFormChanges(indicatorElemSelector, formContainerSelector, saveBtnSelector ) } ) ;
}
function startTrackFormChanges( indicatorElemSelector, formContainerSelector, saveBtnSelector ){
   var indicatorElem = $(indicatorElemSelector + ", " + saveBtnSelector);
   indicatorElem.removeClass('has-change');
   var form = $(formContainerSelector + ' form');
   var saveBtnElem = $(saveBtnSelector);
   saveBtnElem.click( function(){
     cloneSerialized = form.serialize();
     indicatorElem.removeClass('has-change');
   });
   // var formClone = form.clone();
   var cloneSerialized = form.serialize();
   var checkForChanges = function(){
     var modified = form.serialize() != cloneSerialized;
     indicatorElem.toggleClass( 'has-change', modified );
   }
   var timer = 0;
   form.on('keyup change paste', 'input, select, textarea', function(){
     clearTimeout(timer);
     timer = setTimeout( checkForChanges, 500);
   });
   if(!onbeforeunload_set){
	 onbeforeunload_set = true;
     window.onbeforeunload = function(){
        if ( $('.has-change').length ){
          return "You seem to have unsaved changes.";
        } else {
          return;
        }
     }
   }
}