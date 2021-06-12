const { app, BrowserWindow } = require('electron');  // eslint-disable-line
const fs = require('fs-extra');
const path = require('path');

const appPath = app.getAppPath();
const settingsPath = path.join(app.getPath('userData'), 'preferences.json');

let prefWindow;

const getDefaultPreferences = () => ({
  theme: 'Cyborg',
});

const loadPreferences = () => {
  // Ensure we have the settings file created.
  fs.ensureFileSync(settingsPath);

  // Get our defaults.
  const preferences = getDefaultPreferences();

  // Load any exisiting values.
  let settingsData = {};
  try {
    settingsData = JSON.parse(fs.readFileSync(settingsPath));
  } catch (err) {
    // Catch and release, we'll just use the defaults from there.
  }

  // Merge in settings that in the file an we know how to use.
  const values = Object.getOwnPropertyNames(preferences);
  for (let i = 0; i < values.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(settingsData, values[i])) {
      preferences[values[i]] = settingsData[values[i]];
    }
  }
  prefWindow.webContents.send('preferences_data', preferences);
};

const savePreferences = (settingData) => {
  const preferences = {
    theme: 'Cyborg',
  };

  // Merge in settings that in the file an we know how to use.
  const values = Object.getOwnPropertyNames(preferences);
  for (let i = 0; i < values.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(settingData, values[i])) {
      preferences[values[i]] = settingData[values[i]];
    }
  }
  fs.writeFileSync(settingsPath, JSON.stringify(preferences));
};

const closePreferences = () => {
  prefWindow.close();
};

const openPreferences = () => {
  const htmlPath = `file://${appPath}/app/preferences.html`;
  prefWindow = new BrowserWindow({
    width: 500,
    height: 300,
    resizable: false,
    frame: false,
    webPreferences: {
      contextIsolation: true, // Enabling contextIsolation to protect against prototype pollution.
      disableBlinkFeatures: 'Auxclick', // See: https://github.com/doyensec/electronegativity/wiki/AUXCLICK_JS_CHECK
      enableRemoteModule: false, // Turn off remote to avoid temptation.
      nodeIntegration: false, // Disable nodeIntegration for security.
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      worldSafeExecuteJavaScript: true, // https://github.com/electron/electron/pull/24712
      preload: path.join(appPath, 'app/preferencesPreload.js'),
    },
  });
  prefWindow.loadURL(htmlPath);
  prefWindow.setMenuBarVisibility(false);
  prefWindow.show();
  loadPreferences();
};

exports.openPreferences = openPreferences;
exports.loadPreferences = loadPreferences;
exports.savePreferences = savePreferences;
exports.closePreferences = closePreferences;
