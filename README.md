Goals

- implementing Recoil' atoms and selectors APIs
- only getters and setters, only sync

### TODO

- add tests
- check if removing some useless (used just once) Generics allows TS to infer ttpes properly

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
    - getters and settersù
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
