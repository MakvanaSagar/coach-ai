import Matter from 'matter-js';

let engine, render, runner;
let initialized = false;

export const startAntigravity = () => {
  const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Events, Body } = Matter;

  if (!initialized) {
    initialized = true;
    engine = Engine.create();
    
    // Zero gravity / float
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;

    render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    render.canvas.style.position = 'fixed';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.zIndex = '9999';
    render.canvas.style.pointerEvents = 'none';

    // Borders
    const w = window.innerWidth;
    const h = window.innerHeight;
    const wallOpts = { isStatic: true, restitution: 1 };
    
    World.add(engine.world, [
      Bodies.rectangle(w / 2, -50, w, 100, wallOpts),
      Bodies.rectangle(w / 2, h + 50, w, 100, wallOpts),
      Bodies.rectangle(-50, h / 2, 100, h, wallOpts),
      Bodies.rectangle(w + 50, h / 2, 100, h, wallOpts)
    ]);

    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    
    World.add(engine.world, mouseConstraint);
    Runner.run(Runner.create(), engine);

    // Sync loop
    Events.on(engine, 'afterUpdate', () => {
      engine.world.bodies.forEach(body => {
        const el = body.domNode;
        if (el && el.parentNode) {
          const x = body.position.x - body.width / 2;
          const y = body.position.y - body.height / 2;
          el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        } else if (el && !el.parentNode) {
           // If unmounted by React, remove from world to prevent memory leaks
           World.remove(engine.world, body);
        }
      });
    });
  }

  // Find elements and add them
  const selectors = [
    '.ag-target', '.google-btn', 'a', '.google-logo', '.google-logo span',
    '.simple-input', 'button', '.doc-item', 'h2', 'h1', 'p', 'h3', 'iframe'
  ];

  const rawElements = document.querySelectorAll(selectors.join(', '));
  const newBodies = [];

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // We wait 100ms for React to fully paint the new DOM nodes before calculating bounding client reqs
  setTimeout(() => {
    rawElements.forEach(el => {
      if (el.dataset.ag) return;
      el.dataset.ag = 'true';

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || !el.offsetParent) return;
      if (rect.width > window.innerWidth * 0.9) return;

      const body = Bodies.rectangle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        rect.width,
        rect.height,
        {
          restitution: 0.8,
          friction: 0.1,
          frictionAir: 0.015,
          density: 0.05,
          render: { visible: false } 
        }
      );
      
      body.domNode = el;
      body.width = rect.width;
      body.height = rect.height;

      el.style.position = 'fixed';
      el.style.width = rect.width + 'px';
      el.style.height = rect.height + 'px';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.margin = '0px';
      el.style.zIndex = '10000';
      el.style.boxSizing = 'border-box';
      el.style.transition = 'none'; 

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

      newBodies.push(body);
    });

    if (newBodies.length > 0) {
      World.add(engine.world, newBodies);
    }
  }, 100);
};
