# Brick Breakers Threejs
![image](https://user-images.githubusercontent.com/64339763/210303203-232695cf-9472-40ec-812e-21ce27e8d07f.png)
one of the simplest and old favorite game that i enjoyed playing when i was little
## How to Run

to make the project work you follow this steps.
to initialize the npm environment

```ssh
npm init -y
```

to install parcel file project manager

```ssh
npm install parcel
```

to install threejs the 3D game/web engine

```ssh
npm install three
```

to install cannon-es the physics engine for collision and so

```ssh
npm install cannon-es
```

then you can deploy web page using parcel by excuting the following command in the terminal

```ssh
parcel ./src/index.html
```

## How to Play

The objective of the game is to use the paddle to hit the ball back and forth, trying to destroy all the brick in on the screen while avoid the ball falling and passing the paddle 

## File Structure

- index.html: HTML file that contains the game canvas and links to the necessary JavaScript files.
- main.js: Contains the main game logic and function definitions.
- brick.jpg: Image file used for the brick texture.
- start.png: Image file used for the background made by aseprite
- Deadfeelings.mp3: one of my favorite lofi tracks used as background music

## Dependencies

- three.js: A JavaScript library for creating 3D graphics.
- cannon-es: A JavaScript library for physics simulation.

## References

three.js documentation
cannon-es documentation
