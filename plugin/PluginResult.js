/**
 * Created by zsolt on 3/20/14.
 */

'use strict';
define(['plugin/PluginMessage'], function (PluginMessage) {

    /**
     * Initializes a new instance of a plugin result object.
     *
     * Note: this object is JSON serializable see serialize and deserialize methods.
     *
     * @constructor
     */
    var PluginResult = function () {
        this.initialize();
    };

    /**
     * Initializes all properties of this object.
     */
    PluginResult.prototype.initialize = function () {
        this.success = false;
        this.messages = []; // array of PluginMessages
        this.pluginName = 'PluginName N/A';
        this.finishTime = null;
    };

    /**
     * Gets the success flag of this result object
     *
     * @returns {boolean}
     */
    PluginResult.prototype.getSuccess = function () {
        return this.success;
    };

    /**
     * Sets the success flag of this result.
     *
     * @param {boolean} value
     */
    PluginResult.prototype.setSuccess = function (value) {
        this.success = value;
    };

    /**
     * Returns with the plugin messages.
     *
     * @returns {plugin.PluginMessage[]}
     */
    PluginResult.prototype.getMessages = function () {
        return this.messages;
    };

    /**
     * Adds a new plugin message to the messages list.
     *
     * @param {plugin.PluginMessage} pluginMessage
     */
    PluginResult.prototype.addMessage = function (pluginMessage) {
        this.messages.push(pluginMessage);
    };

    /**
     * Gets the name of the plugin to which the result object belongs to.
     *
     * @returns {string}
     */
    PluginResult.prototype.getName = function () {
        return this.pluginName;
    };

    //------------------------------------------------------------------------------------------------------------------
    //--------------- Methods used by the plugin manager

    /**
     * Sets the name of the plugin to which the result object belongs to.
     *
     * @param pluginName - name of the plugin
     */
    PluginResult.prototype.setName = function (pluginName) {
        this.pluginName = pluginName;
    };

    /**
     * Gets the ISO 8601 representation of the time when the plugin finished its execution.
     *
     * @returns {string}
     */
    PluginResult.prototype.getTime = function () {
        return this.finishTime;
    };

    /**
     * Sets the ISO 8601 representation of the time when the plugin finished its execution.
     *
     * @param {string} time
     */
    PluginResult.prototype.setTime = function (time) {
        this.finishTime = time;
    };


    /**
     * Serializes this object to a JSON representation.
     *
     * @returns {{success: boolean, messages: plugin.PluginMessage[], pluginName: string, finishTime: stirng}}
     */
    PluginResult.prototype.serialize = function () {
        var result = {
            success: this.success,
            messages: [],
            pluginName: this.pluginName,
            finishTime: this.finishTime
        };

        for (var i = 0; i < this.messages.length; i += 1) {
            result.messages.push(this.messages[i].serialize());
        }

        return result;
    };

    /**
     * Deserializes the given serialized plugin result object.
     *
     * @param {{success: boolean, messages: plugin.PluginMessage[], pluginName: string, finishTime: stirng}} json
     */
    PluginResult.prototype.deserialize = function (json) {
        this.initialize();

        if (json) {
            this.success = json.success;
            this.pluginName = json.pluginName;
            this.finishTime = json.finishTime;

            for (var i = 0; i < json.messages.length; i += 1) {
                var pluginMessage = new PluginMessage();
                pluginMessage.deserialize(json.messages[i]);
                this.messages.push(pluginMessage);
            }
        }
    };

    return PluginResult;
});