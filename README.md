# Re-implementing basic Recoil API

The goal of this repository is adding a new step to my learning path: re-implementing framework API (inspired by [Kent' article](https://kentcdodds.com/blog/how-to-implement-usestate-with-usereducer)).

The implementd Recoil (v0.11) API are:

- `RecoilRoot`
- `atom` (sync version only)
- `selector` (sync version only)
- Based on Recoil

Notes for the article:

- playing with the infer types
- https://bennetthardwick.com/blog/recoil-js-clone-from-scratch-in-100-lines

### TODO

checks:

- check what happens if a selector subscribes twice to the same atom X
- check what happen if a component change the observed atom √

Article topics:

- what is Recoil
- state of Recoil
- why re-implementing API
  - learning in different ways
  - quote kent
  - link to your article
- the recoil api and features
  - atoms
  - selectors
  - only the interested components are re-rendered
- what I need
  - types
  - core
    - an object containing all the atoms and selectors
      - in order to get/set the value and access selectors get
      - in order to collect the subscriptions
    - a subscriber
    - getters and setters
  - api
    - atom and selector creators
    - a subscribing useValue hook
    - a subscribing useRecoilState hook
    - a spy to get the dependencies tree
  - app
    - some super simple input fields connected to atoms
    - a selector that depends on some atoms
    - a selector that depends on a selector
    - a selector that sets both
  - writing the tests...
    - I need RecoilRoot
- differences with recoil
  - same value to an atom doesn't make the components re-render
- note
  - codesandbox default eslint configuration
  - add "edit on codesandbox link"
