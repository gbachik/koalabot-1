### apiAddCmd(keyword, functionName, rbac, desc) 

Adds a command, makes it lower case. It will call the function name you send it.
The function will be given these parameters: params (array), from (string), mod (boolean), subscriber (boolean)

**Parameters**

**keyword**: `String`, The !command a user types in

**functionName**: `String`, What function to call.

**rbac**: `String`, Role-based access control. Choose from: off, all, reg, sub, mod, or bot. Off disables the command, even for the streamer. All is self explanatory. Reg is for regulars and above (sub, mod, bot). Sub is for subscribers and above (mod, bot). Mod is for moderators and above (bot). Bot is for the bot itself AND the streamer.

**desc**: `String`, a short description of the command. 

**Returns**: `Boolean`, True if success, false if fail


### apiChangeRBAC(keyword, rbac) 

Adds a command, makes it lower case. It will call the function name you send it.
The function will be given these parameters: params (array), from (string), mod (boolean), subscriber (boolean)

**Parameters**

**keyword**: `String`, The !command a user types in

**rbac**: `String`, Role-based access control. See apiAddCmd.

**Returns**: `Boolean`, True if success, false if fail


### apiAddTab(moduleName) 

Adds a module to the dropdown and creates a page.
If the module only adds commands and doesn't require a user interface, this doesn't need to be used.

**Parameters**

**moduleName**: `String`, the name of the module

**Returns**: `String`, the id of the page to $(id).prepend / $(id).html / $(id).append


### apiSay(text) 

Writes to the chat. It outputs as [+] to show it's a module rather than [!] that the base bot uses.

**Parameters**

**text**: `String`, The text to say in the chat


### apiLog(text) 

Only outputs to the chatlog and your chat window, but does not send a chat message for others to see. It is used to notify the streamer of things.

**Parameters**

**text**: `String`, The text to log


### apiGetPath() 

Gets the path to the mods folder, ex:  C:\bot\mods\

**Returns**: `String`, path to the mods folder, including trailing slash


### apiGetChannelName() 

Gets the channel name, which is likely also the streamer's name.

**Returns**: `String`, the channel name


### apiGetBotName() 

Gets the bot name.

**Returns**: `String`, the bot name


### apiGetPointsUnit() 

Gets the unit for points.

**Returns**: `String`, the points unit


### apiGetPoints(username) 

Gets the number of points a user has.

**Parameters**

**username**: `String`, case insensitive

**Returns**: `integer`, null if not found, otherwise the amount of points of the user


### apiGetMinutes(username) 

Gets the number of minutes a user has been in the stream while the bot is also in the stream.

**Parameters**

**username**: `String`, case insensitive

**Returns**: `integer`, null if not found, otherwise the amount of minutes the user has been in the stream


### apiSetPoints(username, points) 

Sets the points a user has.

**Parameters**

**username**: `String`, case insensitive

**points**: `integer`, what to set the user's points to

**Returns**: `integer`, null if not found, otherwise the amount of points of the user


### apiModPoints(username, points) 

Modifies the points a user has.

**Parameters**

**username**: `String`, case insensitive

**points**: `integer`, what to add to the uesr's points. To subtract, send a negative number

**Returns**: `integer`, null if not found, otherwise the amount of points of the user


### apiOpenFile(filename) 

Opens a file in the \mods\ directory.
To load an object, do something like:  $.parseJSON( apiOpenFile("modExampleSettings.ini") );

**Parameters**

**filename**: `String`, case sensitive, the path to the \mods\ directory is included

**Returns**: `String`, the file contents, null if it doesn't exist


### apiAppendFile(filename, text) 

Appends a new line of text to the end a file in the \mods\ directory.
If a file isn't found, it will automatically be created, then appended to.

**Parameters**

**filename**: `String`, case sensitive, the path to the \mods\ directory is included

**text**: `String`, what to add to the contents of the file

**Returns**: `string`, true if success, false if fail


### apiWriteFile(filename, text) 

Writes a file in the \mods\ directory. This will completely over-write an existing file.
To save an object, do something like:  apiWriteFile( "modExampleSettings.ini", JSON.stringify( modExampleSettings ) );

**Parameters**

**filename**: `String`, case sensitive, the path to the \mods\ directory is included

**text**: `String`, what to make the contents of the file

**Returns**: `Boolean`, true if success, false if fail


### apiGetRecentEvents() 

Gets an array of the recent events, in format:

{ "time": (integer milliseconds since midnight of January 1, 1970), "type": (string), "text": (string) }

Type will be "SUB", "HOST", "FOLLOW", or anything that a module adds

**Parameters**

**Returns**: `Array`


### apiAddRecentEvent(type, text)

Adds to the recent events array. Recent events is used to send to a page via ajax, most likely.

**Parameters**

**type**: `String`, can be anything, the bot uses SUB, HOST, and FOLLOW for those events. Use your own type if you need to.

**text**: `String`, the data. For SUB, HOST, and FOLLOW, it's only the username.


### apiHotKey(hotkey) 

Adds a global hotkey. Supported keys: A-Z, 0-9, Comma, Period, Home, End, PageUp, PageDown, Insert, Delete, Arrow keys (Up, Down, Left, Right) and the Media Keys (MediaNextTrack, MediaPlayPause, MediaPrevTrack, MediaStop) 

Combine them with Ctrl, Alt, or Shift. Ex: "Ctrl+Alt+Comma" 

On OSX, Ctrl is command. These global hotkeys will block the normal function of those keys.

**Parameters**

**hotkey**: `String`, See above comments on format

**Returns**: `Object`, use to set functionality of the hotkey: (object name).on("active", function(){ });
