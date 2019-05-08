# Frontfy CLI

**Frontfy-cli** aims to generate a new [Frontfy](https://github.com/owfrontend/frontfy) project already configured and with the possibility of creating pages, components and directives.


## Installation

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
| What technology do you want to use? | The choices are [NodeJS](https://github.com/owfrontend/frontfy) or [PHP](https://github.com/owfrontend/frontfy-php) |

#### Questions about the repository

| Question | Description |
| ------------- |-----|
| Do you like to create a repository in Bitbucket? | Y/n |
| Who is the owner of the project? | Project owner on Bitbucket. Default is *owinteractive* the owner of Frontfy. |
| Enter with your key and secret: | To authorize the repository creation at Bitbucket we need your OAuth Key/Secret. See more in the section **Configuration -  OAuth Consumer**. |

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

Run the command above:

```sh
$ frontfy generate component Message
```

When generating a component the same is created inside *src/assets/js/components*.

#### Directive

Run the command above:

```sh
$ frontfy generate directive date-convert
```

When generating a directive it is created in *src/assets/js/directives*.

#### Page

Run the command above:

```sh
$ frontfy generate page about
```

When generating a new page it is created in *src/views/site*. The page is created using the [EJS](https://ejs.co/) template.
 A new route to this page is created and added to the express router. So if you generate a page called "about", you'll already be able to access it in your browser. Example: http://localhost:3301/about.


## Configuration

### Frontfy CLI

#### Use the CLI to publish your project - OAuth Consumer

For create a new repository it is necessary create an OAuth Consumer on Bitbucket. Access BitBucket -> Settings -> OAuth -> OAuth Consumers -> Add consumer. It is necessary to fill in the following fields:

| Label | Value |
| ---- |-------|
| Name | frontfy |
| Callback URL | http://localhost:3301/oauth-callback |
| Permissions | Repositories (write and admin) |

Save and go ahead!

### Frontfy

#### Configuration file (config/.env)

Access the .env file inside the /config folder. Open it and configure the following properties:

| Key | Value (default) | Description |
| --- |:-------:|-------------|
| NODE_ENV | development | Controls the project environment, the values can be development or production|
| VUE_DEV | true | Controls the browser VueJS plugin |
| PORT | 8080 | Server port |
| REDIS_HOST | 127.0.0.1 | IP address of the Redis server |
| REDIS_PASSWORD | null | If set, client will run Redis auth command on connect.  |
| REDIS_PORT | 6379 | Port of the Redis server |
| MAIL_SENDER  | null | When an error occurs in the application an email is sent, put here the sender's email. |
| MAIL_SENDER_PW  | null | The sender's password |
| MAIL_RECEIVER  | null | Put here the receiver e-mail |

#### Panel Authentication

The project contains a Redis administration panel. To access this panel you must have a [Firebase Authentication](https://firebase.google.com/docs/auth) user and password. Create a new project in Firebase, inside the Frontfy Project access the file *src/assets/js/services/firebase/config.js* and configure with your exclusive Firebase API Configuration.

License
----

[MIT](http://opensource.org/licenses/MIT)
