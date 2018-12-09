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
	shaderSource = Shell.get_file_contents_utf8_sync(' vec3 rgb2hsv(vec3 c) { 	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); 	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); 	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));  	float d = q.x - min(q.w, q.y); 	float e = 1.0e-10; 	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); }  vec3 hsv2rgb(vec3 c) { 	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); 	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); 	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }  vec3 correctFilter(vec3 hsl){ 		    		  vec2 prev, cur; 		  prev=vec2(1.0,1.0); 		 		if (hsl.x < prev.x){ 						 cur=prev; 						 prev=vec2(0.71,0.725); 			  } 			  if (hsl.x < prev.x){ 						 cur=prev; 						 prev=vec2(0.36,0.36); 			  } 			  if (hsl.x < prev.x){ 						 cur=prev; 						 prev=vec2(0.175,0.27314814814814814); 			  } 			  if (hsl.x < prev.x){ 						 cur=prev; 						 prev=vec2(0.15694,0.05092592592592592); 			  } 			  if (hsl.x < prev.x){ 						 cur=prev; 						 prev=vec2(0.0,0.0); 			  }  	 		float coeff = (hsl.x - prev.x) / (cur.x - prev.x); 		  hsl.x = (coeff*(cur.y-prev.y) + prev.y);  		    		  prev = vec2(0.0,0.0); 		  cur = vec2(0.2,0.4); 		  if (hsl.y > cur.x){ 					 prev=cur; 					 cur=vec2(1.0,0.99); 		  }  		  coeff = (hsl.y - prev.x) / (cur.x - prev.x); 		  hsl.y = (coeff*(cur.y-prev.y) + prev.y);  		  return hsl; }   uniform sampler2D tex;  void main() { 	vec4 texColor = texture2D(tex, cogl_tex_coord_in[0].st); 	vec3 hsl = rgb2hsv(vec3(texColor.r,texColor.g,texColor.b)); 	hsl=correctFilter(hsl); 	texColor.rgb = hsv2rgb(hsl); 	cogl_color_out = texColor; } ');
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
