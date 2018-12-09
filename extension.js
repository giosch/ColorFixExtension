const Lang = imports.lang;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Shell   = imports.gi.Shell;


const HOTKEY = "<Super>i::"

var connectionID;
var active = false;

const ColorFixEffect = new Lang.Class({
	Name: 'ColorFixEffect',
	Extends: Clutter.ShaderEffect,

	_init: function(params) {
		this.parent(params);
		this.set_shader_source(shaderSource);
	},

	vfunc_paint_target: function() {
		this.set_uniform_value("tex", 0);
		this.parent();
	}
});
var shaderSource;
//every extension.js must have init+enable+disable
function init() {
	shaderSource = Shell.get_file_contents_utf8_sync("/home/giosch/.shader.glsl");
}

function setupHotKey(){
	Main.keybindingManager.addHotKey('colorfix-on', 'space', Lang.bind(this, this.toggle));
}
function cleanupHotKey(){
	Main.keybindingManager.removeHotKey('colorfix-on', 'space', Lang.bind(this, this.toggle));
}

function enable(){
	setupHotKey();
	toggle();
}

function disable(){
	cleanupHotKey();
	deactivate();
}

function toggle(){
		if (active) {
			active = false;
			deactivate();
		} else {
			active = true;
			activate();
		}
}

function deactivate() {
	global.display.disconnect(connectionID);
	global.get_window_actors().forEach(function(actor) {
			actor.remove_effect_by_name('colorfix');
	});
}

function activate() {
		connectionID = global.display.connect('window-created', Lang.bind(this, this.scanAndApply));
		scanAndApply();
}

function scanAndApply(){
	global.get_window_actors().forEach(applyShader);
}

function applyShader(actor){
		if (actor.get_effect("colorfix")) { return; }
		let effect = new ColorFixEffect();
		actor.add_effect_with_name('colorfix', effect);
}
