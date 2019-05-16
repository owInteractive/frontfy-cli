# Frontfy CLI

**Frontfy-cli** aims to generate a new [Frontfy](https://github.com/owInteractive/frontfy) project already configured and with the possibility of creating pages, components and directives.


## Installation

Prerequisites: Node.js (>=8.x), npm version 3+ and Git.

```sh
$ npm i -g frontfy-cli
```


## Usage

```sh
frontfy <command>
```


## Commands

Commands currently available:

### Init

> The init command is used to create a new, clean and configured Frontfy project.

```sh
$ frontfy init
```

The init method contains some questions after calling:

#### Questions about the project

| Question | Description |
| ------------- |-----|
| How would you like to name the project? | This command has a prefix **front.** and a suffix **.com.br**. So if the input is "example" the result for this question is **front.example.com.br** |
| What technology do you want to use? | The choices are [NodeJS](https://github.com/owInteractive/frontfy) or [PHP](https://github.com/owInteractive/frontfy-php) |

#### Questions about the repository

| Question | Description |
| ------------- |-----|
| Do you like to create a repository? | The choices are Bitbucket, Github or None. |
| Enter with your Client ID/Key: | To authorize the repository creation at Bitbucket we need your OAuth Client ID/Key. See more in the section **Configuration - OAuth authentication**. |
| Enter with your Client Secret: | To authorize the repository creation at Bitbucket we need your OAuth Client Secret. See more in the section **Configuration - OAuth authentication**. |
| Who is the owner of the project? (Only in Bitbucket) | Project owner on Bitbucket. Default is *owinteractive* the owner of Frontfy. |

#### Run the project
| Question | Description |
| ------------- |-----|
| Do you like to run the project? | (Y/n) |

### Generate

> The generate command is used to generate a new component, directive or page. This commands only works in the NodeJS project for now.

```sh
$ frontfy generate
```

or 

```sh
$ frontfy generate <type> <name>
```

The first example will have some questions, such as what you want to generate and the name of the item being generated. The second example is a syntax sugar for the first. You will already pass the type (component, directive or page) and the name of the item directly.

#### Component

Run the command below:

```sh
$ frontfy generate component Message
```

When generating a component the same is created inside *src/assets/js/components*.

#### Directive

Run the command below:

```sh
$ frontfy generate directive date-convert
```

When generating a directive it is created in *src/assets/js/directives*.

#### Page

Run the command below:

```sh
$ frontfy generate page about
```

When generating a new page it is created in *src/views/site*. The page is created using the [EJS](https://ejs.co/) template.
 A new route to this page is created and added to the express router. So if you generate a page called "about", you'll already be able to access it in your browser. Example: http://localhost:3301/about.


## Configuration

### OAuth authentication

#### Bitbucket

To authorize the Bitbucket we need your OAuth Client Key and Client Secret. Follow the steps below: 

1) If you don't have one go to Bitbucket (https://bitbucket.org); 
2) Click on your profile picture; 
3) Click on Bitbucket settings; 
4) Click on OAuth; 
5) Click on Add consumer; 
6) Fill the fields: 
    * Name: frontfy 
    * Callback URL: http://localhost:3301/oauth-callback 
    * Permissions: check repositories options write and admin 
7) Click on Save to get your key and secret.

#### Github
To authorize the Github we need your OAuth Client ID and Client Secret. Follow the steps below: 

1) If you don't have one go to Github (https://github.com); 
2) Click on your profile picture; 
3) Click on Settings; 
4) Click on Developer Settings; 
5) Click on Register a new aplication; 
6) Fill the fields: 
    * Application name: frontfy 
    * Homepage URL: http://localhost:3301
    * Authorization callback URL: http://localhost:3301/oauth-callback 
7) Click on Register application to get your key and secret.

### Frontfy configurations

See the documentation in [Frontfy repository](https://github.com/owInteractive/frontfy).

License
----

[MIT](http://opensource.org/licenses/MIT)
