# Commit Context Action

[![LICENSE](https://img.shields.io/badge/license-BSD3-green)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/truemark/commit-context-action)](https://github.com/truemark/commit-context-action/releases)
![GitHub closed issues](https://img.shields.io/github/issues-closed/truemark/commit-context-action)
![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/truemark/commit-context-action)
![build-test](https://github.com/truemark/commit-context-action/workflows/build-test/badge.svg)

This action will either read or save the context for the current commit SHA to a GitHub repository variable. By providing a value, 
the action will save the commit context to the specified repository variable. Otherwise, the action will read from it instead.

## Examples
```yml
  read:
    runs-on: ubuntu-latest
    steps:
      - name: Read commit context
        id: read
        uses: truemark/commit-context-action@v1
        with:
          token: "${{ secrets.API_TOKEN }}"
      - name: Print Commit Context
        run: |
          echo value ${{ steps.read.outputs.value }}
```
```yml
  write:
    runs-on: ubuntu-latest
    steps:
      - name: Save commit context
        id: write
        uses: truemark/commit-context-action@v1
        with:
          token: "${{ secrets.API_TOKEN }}"
          value: "my-value:${{ github.run_number }}"
      - name: Print Commit Context
        run: |
          echo value ${{ steps.write.outputs.value }}
```

## Inputs
| Name                | Type   | Required | Description                                                                                                                                 |
|---------------------|--------|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| max-entries         | number | No       | The maximum number of entries before pruning. Defaults to 20.                                                                               |
| org                 | string | No       | The GitHub organization in which the repository lives under.                                                                                |
| repository-variable | string | No       | The name of the repository variable to store the commit context. Must start with a letter and defaults to commit_context.                   |
| token               | string | Yes      | The API or personal access token to authorize read and write access to Repository Variables. Note: secrets.GITHUB_TOKEN will not work here. |
| value               | string | No       | The commit context that should be saved for the current commit SHA. If not provided, the action will retrieve the context instead.          |

## Outputs
| Name  | Type   | Description                                                                                              |
|-------|--------|----------------------------------------------------------------------------------------------------------|
| value | string | The commit context for the current commit SHA. If not found during a read, this will be an empty string. |

## Development
> Install `node version 18`

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run all
```

Run the tests :heavy_check_mark:
```bash
$ npm test
```
