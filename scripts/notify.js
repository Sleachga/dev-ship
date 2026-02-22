const { exec } = require('child_process');
const os = require('os');

if (os.platform() === 'win32') {
  exec('powershell -c "[System.Media.SystemSounds]::Exclamation.Play()"');
} else if (os.platform() === 'darwin') {
  exec('afplay /System/Library/Sounds/Glass.aiff');
} else {
  exec('paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null || echo -ne "\\a"');
}
