-- Token authentication
-- Copyright (C) 2015 Atlassian

local log = module._log;
local host = module.host;
local st = require "util.stanza";
local is_admin = require "core.usermanager".is_admin;
local jid_bare = require "util.jid".bare;
local jid = require "util.jid";
local room_created = nil;
local inspect = require('inspect');
local get_room_from_jid = module:require "util".get_room_from_jid;

local parentHostName = string.gmatch(tostring(host), "%w+.(%w.+)")();
if parentHostName == nil then
	log("error", "Failed to start - unable to get parent hostname");
	return;
end

local parentCtx = module:context(parentHostName);
if parentCtx == nil then
	log("error",
		"Failed to start - unable to get parent context for host: %s",
		tostring(parentHostName));
	return;
end

local token_util = module:require "token/util".new(parentCtx);

-- no token configuration
if token_util == nil then
    return;
end

log("debug",
	"%s - starting MUC token verifier app_id: %s app_secret: %s allow empty: %s",
	tostring(host), tostring(token_util.appId), tostring(token_util.appSecret),
	tostring(token_util.allowEmptyToken));

local function verify_user(session, stanza)
	log("debug", "Session token: %s, session room: %s",
		tostring(session.auth_token),
		tostring(session.jitsi_meet_room));

	-- token not required for admin users
	local user_jid = stanza.attr.from;
	if is_admin(user_jid) then
		log("debug", "Token not required from admin user: %s", user_jid);
		return nil;
	end

    log("debug",
        "Will verify token for user: %s, room: %s ", user_jid, stanza.attr.to);
    log("debug", "Is_guest status is: %s", tostring(session.is_guest));
    if not token_util:verify_room(session, stanza.attr.to) then
        log("error", "Token %s not allowed to join: %s",
            tostring(session.auth_token), tostring(stanza.attr.to));
        session.send(
            st.error_reply(
                stanza, "cancel", "not-allowed", "Room and token mismatched"));
        return true; -- we need to just return non nil
    elseif session.is_guest == true then
	if session.room_created == nil then
		return nil;
		--log("error", "Token %s is a guest user, must wait for owner to join: %s",
    --        	tostring(session.auth_token), tostring(stanza.attr.to));
    --    	session.send(
    --        		st.error_reply(
    --            	stanza, "auth", "not-authorized", "Validated as guest user."));
		--return true;
	end
    end
	log("debug",
        "allowed: %s to enter/create room: %s", user_jid, stanza.attr.to);
end

module:hook("muc-room-pre-create", function(event)
	local origin, stanza = event.origin, event.stanza;
	log("debug", "pre create: %s %s", tostring(origin), tostring(stanza));
	return verify_user(origin, stanza);
end);

module:hook("muc-occupant-pre-join", function(event)
	local origin, room, stanza = event.origin, event.room, event.stanza;
	log("debug", "pre join: %s %s", tostring(room), tostring(stanza));
	local room_string = jid.split(stanza.attr.to);
	local roomaddress = room_string.."@conference.live.staging.belouga.org";
	local room = get_room_from_jid(roomaddress);
	if room then
		--log("debug", inspect(room));
		local affiliations = room._affiliations;
		for k,v in pairs(affiliations) do
			if(string.find(k, 'focus') == nil) then
				if(v == 'owner' or v == 'moderator' or v == 'participant') then
					origin.room_created = true;
				end
			end
		end
		log("debug", inspect(affiliations));
	end
	return verify_user(origin, stanza);
end);
