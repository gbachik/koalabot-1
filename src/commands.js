/*
	Copyright (C) 2016  skhmt

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
	commands.js is a library of functions that parse commands or deal with command logic.
*/

var cmds = {};
var lap;

function cmdSetup() {
	
	$("#addCmdButton")
		.button()
		.click(function() {
			addCmdButton();
	} );

	$("#resetLap")
		.button()
		.click(function() {
			resetLap();
	} );

	$("#uptimeRadioSet").buttonset();

	$("#updateGameButton")
		.button()
		.click(function() {
			changeGame(settings.username, $("#gameField").val());
	} );

	$("#updateStatusButton")
		.button()
		.click(function() {
			changeStatus(settings.username, $("#statusField").val());
	} );
	
	try {
		var readFile = fs.readFileSync( `${execPath}\\settings\\cmdSettings.ini` );
		cmds = $.parseJSON( readFile );
	} catch(e) { // if there isn't a modSettings.ini, just use the default settings
		cmds = {
			symbol : "!",
			custom : [], //{name, userType, text}
			quotes: [],
			uptime: "bot",
			songRequests: true
		};
	}
	
	// loading lap info
	try {
		var readFile = fs.readFileSync( `${execPath}\\logs\\lap.log`, "utf8" );
		lap = new Date( parseInt(readFile,10) );
		$("#lapTime").html( `${lap.toDateString()} ${lap.toLocaleTimeString()}` );
	} catch(e) { // if there isn't a modSettings.ini, just use the default settings
		resetLap();
	}

	// uptime buttons config
	if ( cmds.uptime === "lap" ) {
		$("#uptimeRadioLap").attr( "checked", true );
	} else if( cmds.uptime === "stream" ) {
		$("#uptimeRadioStream").attr( "checked", true );
	} else {
		$("#uptimeRadioBot").attr( "checked", true );
	}
	$("#uptimeRadioSet").buttonset( "refresh" );

	// uptime listener
	$("#uptimeRadioSet input[type=radio]").change( function() {
		if ( this.value === "bot" ) {
			cmds.uptime = "bot";
		} else if ( this.value === "stream" ) {
			cmds.uptime = "stream";
		} else {
			cmds.uptime = "lap";
		}
		save();
	} );

	refreshCommands();
	refreshQuotes();
}

// the first character of text is a !
function parseCommand( text, from, mod, subscriber ) {
	// make an array of all the words, delineated by spaces
	var cmd = text.split(" ");
	
	var lcCmd = cmd[0].toLowerCase(); //make all commands lowercase
	
	if ( true ) { // to turn off commands, implement a setting option later for this.
		// find out which command it is
		switch( lcCmd ) {
			// UPTIME
			case cmds.symbol + "bottime":
				cmdSay( `The bot has been running for ${timeDifference( startDate.getTime() )}` );
				break;
			case cmds.symbol + "streamtime":
				streamTime();
				break;
			case cmds.symbol + "laptime":
				cmdSay( `The current lap time is ${timeDifference( lap.getTime() )}` );
				break;
			case cmds.symbol + "uptime":
				if ( cmds.uptime === "bot" ) {
					cmdSay( `Uptime: ${timeDifference( startDate.getTime() )}` );
				} else if ( cmds.uptime === "stream" ) {
					streamTime();
				} else {
					cmdSay( `Uptime: ${timeDifference( lap.getTime() )}` );
				}
				break;

			// MISC
			case cmds.symbol + "updawg":
				cmdSay( "What's !updawg ?" );
				break;
			case cmds.symbol + "highlight":
			case cmds.symbol + "ht":
				if ( mod ) highlightThis( from, cmd );
				break;
			case cmds.symbol + "permit":
				if ( mod ) permit( cmd );
				break;
			case cmds.symbol + "bot":
				cmdSay( "This is KoalaBot. It is being developed by skhmt using NW.js. Get it at: https://github.com/Skhmt/twitch-bot" );
				break;

			// GAME & STATUS
			case cmds.symbol + "game":
				if ( mod ) changeGame( from, cmd.join(" ").substring(6) );
				break;
			case cmds.symbol + "status":
				if ( mod ) changeStatus( from, cmd.join(" ").substring(8) );
				break;
				break;

			// QUOTES
			case cmds.symbol + "quote":
				quote( cmd );
				break;
			case cmds.symbol + "addquote":
				addQuote( cmd );
				break;
			case cmds.symbol + "delquote":
				if ( mod ) delQuote( cmd );
				break;

			// SONGS
			case cmds.symbol + "currentsong":
				getSong();
				break;
			case cmds.symbol + "skipsong":
				if ( mod ) nextSong();
				break;
			case cmds.symbol + "volume":
				if ( mod ) setVolume( cmd[1] );
				break;
			case cmds.symbol + "mute":
				if ( mod ) toggleMute();
				break;
			case cmds.symbol + "songrequest":
				addSong( cmd[1], from );
				break;

			// RAFFLE
			case cmds.symbol + $("#raffleKeyword").val():
				addToRaffle( from );
				break;

			// CUSTOM COMMANDS
			case cmds.symbol + "addcmd":
			case cmds.symbol + "addcom":
				if ( mod ) addCmd( from, cmd );
				break;
			case cmds.symbol + "delcmd":
			case cmds.symbol + "delcom":
				if ( mod ) delCmd( from, cmd );
				break;
			default:
				customCommand( from, mod, subscriber, cmd );
				break;
		}
	}
}

function refreshCommands() {
	// clear the commands div
	$("#commands").html("");
	
	// rewrite commands div
	for ( var i = 0; i < cmds.custom.length; i++ ) {
		var output = `<button id='cmdDel${i}' onclick='delCmdButton(${i})'>delete</button>
			<span style='display: inline-block; width: 140px;'><b>${cmds.symbol + cmds.custom[i].name}</b></span>
			<span style='display: inline-block; width: 75px;'><i>`;

		if ( cmds.custom[i].userType == "" ) output += "[All users]";
		else output += `[${cmds.custom[i].userType}]`;
		output += `</i></span>${cmds.custom[i].text}<br />`;
		
		$("#commands").append( output );
		
		// style the button
		$("#cmdDel"+i).button( {
			icons: {
				primary: "ui-icon-closethick"
			},
			text: false
		} );
		
	}
}

// !addcom (-ul=userLevel) [!command]  [text]
// this is a chat function
function addCmd( from, cmd ) {
	if ( cmd[1] == null ) {
		return cmdSay( `Usage: ${cmds.symbol}addcom (-ul=mod) [${cmds.symbol}command] [text]` );
	}
	
	// check if it exists as a fixed command
	
	// check if it exists as a custom command
	
	var tempCommand = {
		name: "",
		userType: "",
		text: ""
	};
	
	if ( cmd[1].substring(0,4) === "-ul=" ) {
		var type = cmd[1].substring(4);
		if ( type === "mod" ) tempCommand.userType = "mod";
		else if ( type === "sub" ) tempCommand.userType = "sub";
		else if ( type === "streamer" ) tempCommand.userType = "streamer";
		cmd.splice(0,2); // removing !addcom -ul=*
	} else {
		cmd.splice(0,1); // removing !addcom
	}
	
	if ( cmd[0] === null ) {
		return cmdSay( `Usage: ${cmds.symbol}addcom (-ul=mod) [${cmds.symbol}command] [text]` );
	}
	
	// get the command name
	if ( cmd[0].charAt(0) === cmds.symbol ) { // store it without the symbol
		tempCommand.name = cmd[0].substring(1);
	} else {
		tempCommand.name = cmd[0];
	}
	tempCommand.name = tempCommand.name.toLowerCase(); // making it lower case
	
	cmd.splice(0,1); // remove the command name
	tempCommand.text = cmd.join(" ");

	cmds.custom.push( tempCommand );
	cmdSay( `Adding command: ${tempCommand.name}, ul: ${tempCommand.userType}, text: ${tempCommand.text}` );
	save();
	refreshCommands();
}

function addCmdButton() {
	var tempName = $("#addCmdName").val();
	
	if ( tempName.charAt(0) === cmds.symbol ) {
		tempName = tempName.substring(1);
	}
	
	var tempCommand = {
		name: tempName.toLowerCase(),
		userType: $("#addCmdUserType").val(),
		text: $("#addCmdText").val()
	};
	
	$("#addCmdName").val("");
	$("#addCmdText").val("");
	
	cmds.custom.push( tempCommand );
	save();
	refreshCommands();
}

function delCmd( from, cmd ) {
	var cmdIndex = "";
	var lcCmd = cmd[1].toLowerCase();
	for ( var i = 0; i < cmds.custom.length; i++ ) {
		// find the command
		var tempName = cmds.symbol + cmds.custom[i].name;
		if ( lcCmd === tempName ) {
			cmdIndex = i;
			break;
		}
	}
	if ( cmdIndex === "" ) return cmdSay( "Error, could not find command." ); //not a valid command
	
	cmds.custom.splice( cmdIndex,1 );
	cmdSay( `Deleted command: ${cmd[1]}` );
	save();
	refreshCommands();
}

function delCmdButton( id ) {
	if ( confirm( `Are you sure you want to delete ${cmds.custom[id].name} ?` ) ) {
		cmds.custom.splice( id, 1 );
		save();
		refreshCommands();
	}
}

// running a custom command
function customCommand( from, mod, subscriber, cmd ) {
	var cmdIndex = "";
	var lcCmd = cmd[0].toLowerCase();
	for ( var i = 0; i < cmds.custom.length; i++ ) {
		// find the command
		var tempName = cmds.symbol + cmds.custom[i].name;
		if ( lcCmd === tempName ) {
			cmdIndex = i;
			break;
		}
	}
	if ( cmdIndex === "" ) return; //not a valid command
	
	// checking permissions
	if ( cmds.custom[cmdIndex].userType === "mod" ){
		if ( !mod ) return;
	} else if ( cmds.custom[cmdIndex].userType === "sub" ) {
		if ( !mod && !subscriber ) return; // requires a sub or mod, user is not a mod and not a sub
	} else if ( cmds.custom[cmdIndex].userType === "streamer" ){
		if ( from !== settings.channel.substring(1) && from !== settings.username ) return;
	}
	
	// Variables!

	var output = cmds.custom[cmdIndex].text;
	output = output.replace(/%1%/g, cmd[1]);
	output = output.replace(/%2%/g, cmd[2]);
	output = output.replace(/%3%/g, cmd[3]);
	output = output.replace(/%4%/g, cmd[4]);
	output = output.replace(/%5%/g, cmd[5]);
	cmdSay(output);
}

function cmdSay( text ) {
	bot.say( settings.channel, text );
	log( `<b>[${cmds.symbol}] ${text}</b>` );
}

// takes a time in miliseconds since Jan 1 1970 and returns the difference between then and now as a string
function timeDifference(oldtime) {

	var dt = new Date();
	var difftime = Math.floor( ( dt.getTime() - oldtime ) / 1000);
	var diffHrs = Math.floor( difftime / 3600 ); //3600 = 60*60 = seconds per hour
	var diffMins = Math.floor( (difftime % 3600) / 60);
	var diffSecs = difftime - (diffHrs * 3600) - (diffMins * 60);

	var output = "";
	
	if ( diffHrs === 1 ) output += diffHrs + " hour, ";
	else if ( diffHrs > 1 ) output += diffHrs + " hours, ";

	if ( diffMins === 1 ) output += diffMins + " minute, ";
	else if ( diffMins > 1 ) output += diffMins + " minutes, ";

	if ( diffSecs === 1 ) output += diffSecs + " second";
	else output += diffSecs + " seconds";

	return output;
}

function highlightThis( from, text ) {
	// Get time the stream started
	$.getJSON(
		`https://api.twitch.tv/kraken/streams/${settings.channel.substring(1)}`,
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response) {
			if ( response.stream === null ) {
				return cmdSay( "Stream offline, cannot create highlight reminder" );
			}

			var created = response.stream.created_at; // ex: "2015-12-03T20:39:04Z"
			var temp = new Date( created );
			var highlight = timeDifference( temp.getTime() );
			
			cmdSay( `${from} highlighted ${highlight}.` );
			
			// write to log
			var dateNow = new Date();
			var output = `[${dateNow.toDateString()}, ${dateNow.toLocaleTimeString()}]`;
			output += ` ${from}: `;
			output += highlight;
			if ( text.length > 1 ) {
				output += " ( ";
				for ( var i = 1; i < text.length; i++ ){
					output += text[i] + " ";
				}
				output += ")";
			}
			output += "\r\n";

			fs.appendFile( `${execPath}\\logs\\highlights.log`, output, function(err) {
				if (err) log( "* Error writing to highlights" );
			} );
		}
	);
}

function streamTime() {
	$.getJSON(
		`https://api.twitch.tv/kraken/streams/${settings.channel.substring(1)}`,
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response) {
			if ( "error" in response ) {
				return cmdSay(error);
			}
			var created = response.stream.created_at; // ex: "2015-12-03T20:39:04Z"
			var temp = new Date( created );
			var timediff = timeDifference ( temp );
			return cmdSay( `The stream has been live for ${timediff}` );
	} );
}

function resetLap() {
	lap = new Date();

	fs.writeFile( `${execPath}\\logs\\lap.log`, lap.getTime(), function(err) {
		if (err) log( "* Error saving lap time" );
	} );

	$("#lapTime").html( `${lap.toDateString()} ${lap.toLocaleTimeString()}` );
}

// https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-usersuserfollowschannelstarget
// ex of non-follower: {"error":"Not Found","status":404,"message":"skhmt is not following lirik"}
function isFollower( from ) {
	$.getJSON(
		`https://api.twitch.tv/kraken/users/${from}/follows/channels/${settings.channel.substring(1)}`,
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			cmdSay( `${from} is a follower.` );
			/* ex of created_at: "2015-12-03T20:39:04+00:00"
				not doing anything with this for now
			 */
			// var followedTime = response.created_at;
		}
	).error(function() {
		cmdSay( `${from} is not a follower.` );
	} );
}

function changeGame( from, game ) {
	$.get(
		`https://api.twitch.tv/kraken/channels/${settings.channel.substring(1)}`,
		{
			"channel[game]": game,
			"_method": "put",
			"oauth_token": settings.access_token.substring(6)
		}
	);
	
	cmdSay( `${from} has changed the stream game to: ${game}` );
	$("#gameField").val( game );	
}

function changeStatus( from, status ) {
	$.get(
		`https://api.twitch.tv/kraken/channels/${settings.channel.substring(1)}`,
		{
			"channel[status]":status,
			"_method": "put",
			"oauth_token": settings.access_token.substring(6)
		}
	);
	
	cmdSay( `${from} has changed the stream status to: ${status}` );
	$("#statusField").val( status );
}
