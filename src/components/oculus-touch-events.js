/**
 * SRL Oculus Touch debuging component for A-Frame.
 */
AFRAME.registerComponent('srl-oculus-touch-events', {
  schema: {},

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () { 
    var el = this.el;

    console.log("init events")
    
    this.elBack = document.createElement('a-entity');
    this.elBack.setAttribute("geometry",{primitive: "plane", height: 1.4, width: 0.75});
    this.elBack.setAttribute("material",{color: "grey", wireframe: false, opacity: 0.5 });
    this.elBack.setAttribute("position",{x:0,y:-0.05,z:-0.5});
    el.appendChild(this.elBack);

    this.elTextTop = document.createElement('a-entity');
    this.elTextTop.setAttribute("text",{value: "Oculus Quest\nController Events", 
					color: "white", baseline: "bottom",
					align: "center", width: 0.5});    
    this.elTextTop.setAttribute("position",{x:0,y:0.55,z:-0.5});
    this.elTextTop.setAttribute("scale",{x:2,y:2,z:2});
    el.appendChild(this.elTextTop);

    this.eventNames = [
      // tracked-controls
      "controllerconnected",
      "controllerdisconnected",
      "axismove",
      "buttonchanged",
      "buttondown",
      "buttonup",
      "touchstart",
      "touchend",
      "",
      // oculus-touch-controls
      "triggerdown",
      "triggerup",
      "triggertouchstart",
      "triggertouchend",
      "triggerchanged",
      "thumbstickdown",
      "thumbstickup",
      "thumbsticktouchstart",
      "thumbsticktouchend",
      "thumbstickchanged",
      "gripdown",
      "gripup",
      "griptouchstart",
      "griptouchend",
      "gripchanged",
      "abuttondown",
      "abuttonup",
      "abuttontouchstart",
      "abuttontouchend",
      "abuttonchanged",
      "bbuttondown",
      "bbuttonup",
      "bbuttontouchstart",
      "bbuttontouchend",
      "bbuttonchanged",
      "xbuttondown",
      "xbuttonup",
      "xbuttontouchstart",
      "xbuttontouchend",
      "xbuttonchanged",
      "ybuttondown",
      "ybuttonup",
      "ybuttontouchstart",
      "ybuttontouchend",
      "ybuttonchanged",
      "surfacedown",
      "surfaceup",
      "surfacetouchstart",
      "surfacetouchend",
      "surfacechanged"];
    
    let labels = ["object3D.position :",
		  "object3D.rotation :",
		  "axismove.details :",
		  ""];
    labels = labels.concat(this.eventNames.map(o => o + " :"));
    
    this.elTextAttr = document.createElement('a-entity');
    this.elTextAttr.setAttribute("text",{value: labels.join('\n'), color: "white", baseline: "top", align: "right", width: 0.5});    
    this.elTextAttr.setAttribute("position",{x:-0.35,y:0.5,z:-0.5});
    el.appendChild(this.elTextAttr);
    
    this.elTextValue = document.createElement('a-entity');
    this.elTextValue.setAttribute("text",{value: "", color: "yellow", baseline: "top", align: "left", width: 1, wrapCount: 80});    
    this.elTextValue.setAttribute("position",{x:0.4,y:0.5,z:-0.5});
    el.appendChild(this.elTextValue);
    
    this.events = {};
    this.texts = {};
    this.details = {};
    
    for (let i of this.eventNames) {
      if (i != "") {
	el.addEventListener(i, (evt) => {
	  this.events[i] = true;
	  this.details[i] = JSON.stringify(evt.detail);
	})
      }
    }

    el.addEventListener("axismove", (evt) => {
      this.axismove = {x: evt.detail.axis[2], y: evt.detail.axis[3] };
    })
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) { },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  tick: function (t) {
    const decode = (o,cs) => {
      let text = ""
      let sep = " {";
      for(let i of cs) {
	text += sep + i + ": " + o[i].toFixed(2);
	sep = ", ";
      }
      return text + "}";
    }
    
    let values = [];
    values.push(decode(this.el.object3D.position,["x","y","z"]));
    values.push(decode(this.el.object3D.rotation,["x","y","z"]));
    if (this.axismove) {
		values.push(JSON.stringify(this.axismove));
	    } else {
	      values.push("-");
	    }
    values.push("");
    for (let i of this.eventNames) {
      let ch = '   ';
      if (this.events[i]) {
	ch = '#';
      }
      if (i == "") {
	values.push("");
      } else {
	this.texts[i] = (ch + (this.texts[i] || "")).substring(0,79);
	values.push('>' + this.texts[i] + '<');
      }
    }
    this.events = {};
    this.elTextValue.setAttribute("text",{value: values.join("\n")});
  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { },

  /**
   * Event handlers that automatically get attached or detached based on scene state.
   */
  events: {
    // click: function (evt) { }
  }
});
