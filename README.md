# Frontfy CLI

**Frontfy-cli** aims to generate a new Frontfy Project already configured and with the possibility of creating pages, components and directives.

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
| Who is the owner of the project? | Project owner on Bitbucket |
| Enter with your key and secret: | To authorize the repository creation at Bitbucket we need your OAuth Key/Secret. If you don't have one go to Bitbucket -> Settings -> OAuth -> OAuth Consumers -> Add consumer. Inside the page set: name, callback URL to: http://localhost:3301/oauth-callback and give permission to Repositories (Write and Admin). Save and go ahead! |

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

```sh
$ frontfy generate component Message
```

When generating a component the same is created inside *src/assets/js/components*.

#### Directive

```sh
$ frontfy generate directive dateConvert
```

When generating a directive it is created in *src/assets/js/directives*.

#### Page

```sh
$ frontfy generate page about
```

When generating a new page it is created in *src/views/site*. The page is created using the [EJS](https://ejs.co/) template.
 A new route to this page is created and added to the express router. So if you generate a page called "about", you'll already be able to access it in your browser. 
 
Example: http://localhost:3301/about.

License
----

[MIT](http://opensource.org/licenses/MIT)
