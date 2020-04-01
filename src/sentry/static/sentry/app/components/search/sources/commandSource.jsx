import PropTypes from 'prop-types';
import React from 'react';

import {createFuzzySearch} from 'app/utils/createFuzzySearch';
import {openSudo, openHelpSearchModal} from 'app/actionCreators/modal';
import {toggleLocaleDebug} from 'app/locale';
import Access from 'app/components/acl/access';
import Hook from 'app/components/hook';

const ACTIONS = [
  {
    title: 'Open Sudo Modal',
    description: 'Open Sudo Modal to re-identify yourself.',
    action: () =>
      openSudo({
        sudo: true,
      }),
  },

  {
    title: 'Open Superuser Modal',
    description: 'Open Superuser Modal to re-identify yourself.',
    requiresSuperuser: true,
    action: () =>
      openSudo({
        superuser: true,
      }),
  },

  {
    title: 'Toggle Translation Markers',
    description: 'Toggles translation markers on or off in the application',
    requiresSuperuser: true,
    action: () => toggleLocaleDebug(),
  },

  {
    title: 'Search Documentation and FAQ',
    description: 'Open the Documentation and FAQ search modal.',
    action: () => openHelpSearchModal(),
  },
];

/**
 * This source is a hardcoded list of action creators and/or routes maybe
 */
class CommandSource extends React.Component {
  static propTypes = {
    // search term
    query: PropTypes.string,

    // fuse.js options
    searchOptions: PropTypes.object,

    // Array of routes to search
    searchMap: PropTypes.array,

    // Array of actions to add
    actions: PropTypes.array,

    isSuperuser: PropTypes.bool,

    /**
     * Render function that passes:
     * `isLoading` - loading state
     * `allResults` - All results returned from all queries: [searchIndex, model, type]
     * `results` - Results array filtered by `this.props.query`: [searchIndex, model, type]
     */
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    searchMap: [],
    searchOptions: {},
  };

  constructor(...args) {
    super(...args);

    this.state = {
      fuzzy: null,
    };
  }

  componentDidMount() {
    this.createSearch(this.props.actions);
  }

  async createSearch(searchMap) {
    this.setState({
      fuzzy: await createFuzzySearch(searchMap || [], {
        ...this.props.searchOptions,
        keys: ['title', 'description'],
      }),
    });
  }

  render() {
    const {searchMap, query, isSuperuser, children} = this.props;

    const results =
      (this.state.fuzzy &&
        this.state.fuzzy
          .search(query)
          .filter(({item}) => !item.requiresSuperuser || isSuperuser)
          .map(({item, ...rest}) => ({
            item: {
              ...item,
              sourceType: 'command',
              resultType: 'command',
            },
            ...rest,
          }))) ||
      [];

    return children({
      isLoading: searchMap === null,
      allResults: searchMap,
      results,
    });
  }
}

const CommandSourceWithHooks = props => (
  <Hook name="command-palette:action">
    {({hooks}) => <CommandSource {...props} actions={[...hooks, ...ACTIONS]} />}
  </Hook>
);

const CommandSourceWithFeature = props => (
  <Access isSuperuser>
    {({hasSuperuser}) => (
      <React.Fragment>
        <CommandSourceWithHooks {...props} isSuperuser={hasSuperuser} />
      </React.Fragment>
    )}
  </Access>
);

export default CommandSourceWithFeature;
export {CommandSource};
