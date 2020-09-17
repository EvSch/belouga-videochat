local st = require "util.stanza";
local inspect = require('inspect');
local http_get_with_retry = module:require "util".http_get_with_retry;
local json = require "util.json";
-- sends requests to jibri prod manager when starting and stopping
module:hook("pre-iq/full", function(event)
    local stanza = event.stanza;
    if stanza.name == "iq" then
        local jibri = stanza:get_child('jibri', 'http://jitsi.org/protocol/jibri');
        if jibri then
            module:log("info", "stanza attrs %s", inspect(stanza.attr));
            module:log("info", "jibri attrs %s", inspect(jibri.attr));
            if jibri.attr.action == 'start' then
              local sendData = {room = jibri.attr.room, jibri_id = stanza.attr.to, fileMode = jibri.attr.recording_mode};
              if jibri.attr.recording_mode == 'file' then
                local appData = json.decode(jibri.attr.app_data);
                sendData.rec_starter = appData.file_recording_metadata.recording_starter.userId;
              end
              local content = http_get_with_retry("https://belouga.org/videochat/launch_recorder", 0, sendData);
              module:log("info", "request info %s", inspect(content));
            elseif jibri.attr.status ~= nil and jibri.attr.status == 'on' then
              local content = http_get_with_retry("https://belouga.org/videochat/start_record_request", 0);
              module:log("info", "recording started!");
            elseif jibri.attr.action == 'stop' then
              local sendData = {jibri_id = stanza.attr.to};
              local content = http_get_with_retry("https://belouga.org/videochat/stop_record_request", 0, sendData);
              module:log("info", "recording stopped!");
            end
        end
    end
end);
