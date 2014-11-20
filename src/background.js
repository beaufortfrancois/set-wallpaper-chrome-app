var LAYOUTS = [
  { layout: 'STRETCH', title: 'Stretch' }, 
  { layout: 'CENTER', title: 'Center' },
  { layout: 'CENTER_CROPPED', title: 'Crop and center'},
];
var layoutIndex, wallpaperData, wallpaperName;


function incrementLayoutIndex() {
  // Utility function to get next layout.
  var index = layoutIndex + 1;
  if (index === LAYOUTS.length)
    layoutIndex = 0;
  else
    layoutIndex++;
}

function onButtonClicked(notificationId, buttonIndex) {
  // Clear notification on button click.
  chrome.notifications.clear(notificationId, function() {
    incrementLayoutIndex();
    if (buttonIndex === 1)
      incrementLayoutIndex();
    // Set wallpaper with new layout
    setWallpaper(); 
  });
}

function onWallpaperSet() {
  // Ugly hack to get buttons titles.
  var buttons = [];
  incrementLayoutIndex();
  buttons.push({title: LAYOUTS[layoutIndex].title});
  incrementLayoutIndex();
  buttons.push({title: LAYOUTS[layoutIndex].title});
  incrementLayoutIndex();

  // Show notification to let user change layout.
  chrome.notifications.create('id', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('128.png'),
    title: 'Wallpaper has been changed',
    message: '',
    buttons: buttons,
  }, function() {});
}

function setWallpaper() {
  // Simply set wallpaper
  chrome.wallpaper.setWallpaper({
    wallpaperData: wallpaperData,
    layout: LAYOUTS[layoutIndex].layout,
    name: wallpaperName,
  }, onWallpaperSet);
}

function onLaunched(data) {
  // Init layout to STRETCH.
  layoutIndex = 0;

  if (!data.items) {
    chrome.notifications.create('error', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('128.png'),
      title: 'Hmm...',
      message: 'Open the Files App and select an image',
    }, function() {
      setTimeout(function() {
        chrome.notifications.clear('error', function() {});
      }, 5000);
    });
  }
  // Retrieve encoded data from chosen image.
  var imageFileEntry = data.items[0].entry;
  imageFileEntry.file(function(imageFile) {
    var reader = new FileReader();
    reader.onload = function(event) {
      wallpaperData = event.target.result;
      wallpaperName = imageFileEntry.name
      setWallpaper();
    };
    reader.readAsArrayBuffer(imageFile);
  });
}

function onSuspend() {
  // Clear notification when page is about to be unloaded.
  chrome.notifications.clear('id', function(){});
}

chrome.notifications.onButtonClicked.addListener(onButtonClicked);
chrome.runtime.onSuspend.addListener(onSuspend);
chrome.app.runtime.onLaunched.addListener(onLaunched);
