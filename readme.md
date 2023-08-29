# Pokemon Game Wiki Generator

Credit to [@FredericDlugi's](https://github.com/FredericDlugi) original [platinum renegade wiki](https://github.com/FredericDlugi/platinum-renegade-wiki) that served as base design and idea for this project. This project mainly serves as a way to create user-friendly documentation for new and existing pokemon rom hacks (and maybe fan games down the line)

This ReadMe will serve as a step-by-step guide to generating and deploying your own versions of the platinum-renegade-wiki.

## Step 1 - Generate Wiki Folder
This command generates the initial folder structure with some boilerplate files within the `dist/` folder.
```
python generate_wiki.py [--name, -n] <wiki-name>
```
For example: `python generate_wiki.py --name test_wiki` will generate a folder called `test_wiki/`. This will produce an `mkdocs.yml` file and a `docs/` folder containing some initial markdown files.

## Step 2 - Preparing Large Data
NB: _The current scope is limited to existing Pokemon and moves. Therefore, it's not currently possible to add fakemon data. This can be added in a later version_

Some initial data has to be prepared before documentation can be generated. This is all done in the `prepare_large_data.py` file. You can prepare data for Pokemon, moves, machines, and sprites.

### Pokemon
This command will download current Pokemon data up to a specified range. The Pokemon data will be stored in `temp/pokemon.json`.
```
python prepare_large_data.py --pokemon [--range, -r] <range_start> <range_end>
```
For example `python prepare_large_data.py --pokemon -r 1 5` will download Pokemon data from Bulbasaur to Charmeleon

### Moves and Technical Machines
The command will download all current moves and technical machines in Pokemon. The moves and technical machines will be downloaded to the `/temp/moves.json` and `temp/machines.json` respectively.
```
python prepare_large_data.py --moves --machines
```

### Sprites
This command will download current Pokemon sprites. The sprites will be downloaded to the `<wiki_name>/docs/img/pokemon` folder.

**NB: Only do this after gathering all Pokemon data.**
This depends on the pokemon.json file to quickly grab the sprite URL
```
python prepare_large_data.py --sprites [--wiki_name, -wn] <wiki_name>
```

## Step 3 - Data Modification
The data for Pokemon, moves, routes, and encounters are modifiable. You can do this through the application's interface.

Run it by simply:
1. Navigating to the `client\` folder
2. Run `pnpm install` to download the dependencies
3. Run `pnpm run dev` to start up the application and view it on localhost

## Step 4 - Generation
Now for the meat of the matter
Once you're satisfied with the modifications you've made, run `python generate-wiki.py` to generate and enjoy your wiki!
