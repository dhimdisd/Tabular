/** @jsx React.DOM */
(function(window) {
  window.onload = function() {
    var bp = chrome.extension.getBackgroundPage();

    var Tab = React.createClass({
      componentDidUpdate: function() {
        var node = this.getDOMNode();
        if (this.props.data.id === this.props.highlightedId
            && !$(node).isOnScreen()) {

          $(node).goTo();

        }
      },
      handleClick: function(event) {
        chrome.windows.update(this.props.data.windowId, { 'focused': true });

        chrome.tabs.update(this.props.data.id, {
          'active': true,
          'highlighted': true
        });

      },
      handleMouseEnter: function(event) {
        this.props.onMouseEnterListItem(this.props.data.id);
      },
      handleCloseTab: function(event) {
        event.stopPropagation();
        var app = this.props.app;
        for (var i = 0; i < app.state.tabs.length; i++) {
          if (this.props.data.id === app.state.tabs[i].id) {
            break;
          }
        }
        var id = this.props.data.id;
        this.props.onCloseTab(id, i);
        chrome.tabs.remove(id);
      },
      render: function() {
        var data = this.props.data;
        var matches = this.props.matches;
        var title = data.title.split('').map(function(c, i) {
          if (matches && matches.matchedTitleIndices[i]) {
            return React.DOM.strong({ style: { color: 'red' } }, c);
          } else {
            return c;
          }
        });
        var url = data.url.split('').map(function(c, i) {
          if (matches && matches.matchedUrlIndices[i]) {
            return React.DOM.strong({ style: { color: 'red' } }, c);
          } else {
            return c;
          }
        });

        var tab = (
          <li
            id={data.id}
            onClick={this.handleClick}
            onMouseEnter={this.handleMouseEnter}
            className={this.props.highlightedId === data.id ? 'highlighted' : ''}>

            <div className='favIconContainer'>
              <img src={data.favIconUrl} />
            </div>
            <section className='tabDetails'>
              <h3 className='title'>{title}</h3>
              <p className='url'>{url}</p>
            </section>
            <div className='close-btn-container'>
              <div className='close-btn' onClick={this.handleCloseTab}></div>
            </div>
          </li>
        );

        return tab;
      }
    });

    var TabList = React.createClass({
      render: function() {
        var props = this.props;
        var tabs = props.data.map(function(tab, index) {
          var matches = props.matches ? props.matches[index] : null;
          return (
            <Tab
              app={props.app}
              data={tab}
              highlightedId={props.highlightedId}
              matches={matches}
              onCloseTab={props.onCloseTab}
              onMouseEnterListItem={props.onMouseEnterListItem} />
          );
        });

        return <ul id='tabsList'>{tabs}</ul>;
      }
    });

    var SearchBox = React.createClass({
      searchTimeout: undefined,
      handleChange: function(event) {
        function matchedIndices(search, text) {
          var indices = [];
          var i = 0;
          var j = 0;
          for (i; i < text.length; i++) {
            if (search[j] && search[j].toUpperCase() === text[i].toUpperCase()) {
              indices[i] = true;
              j++;
            } else {
              indices[i] = false;
            }
          }
          return indices;
        }

        var _this = this;
        if (_this.searchTimeout !== undefined) clearTimeout(_this.searchTimeout);
        _this.searchTimeout = setTimeout(function() {
          var searchVal = _this.refs.input.getDOMNode().value;
          var searchRgx = new RegExp(searchVal.replace(/(.)/g, '$1' + '.*'), 'i');
          var filteredTabs = bp.tabs.filter(function(tab) {
            return searchRgx.test(tab.title) || searchRgx.test(tab.url);
          });
          var matches = filteredTabs.map(function(tab) {
            var matchedTitleIndices =
              searchRgx.test(tab.title)
                ? matchedIndices(searchVal, tab.title)
                : tab.title.split('').map(function(c) { return false; });
            var matchedUrlIndices =
              searchRgx.test(tab.url)
                ? matchedIndices(searchVal, tab.url)
                : tab.url.split('').map(function(c) { return false; });

            return {
              matchedTitleIndices: matchedTitleIndices,
              matchedUrlIndices: matchedUrlIndices
            };
          });

          _this.props.onInput({
            tabs: filteredTabs,
            highlightedId: filteredTabs[0] ? filteredTabs[0].id : null,
            matches: matches
          });
        }, 500);
      },
      render: function() {
        return (
          <form>
            <input
              type='text'
              placeholder='Search page titles and URLs...'
              autoFocus='true'
              ref='input'
              onChange={this.handleChange} />
          </form>
        );
      }
    });

    var App = React.createClass({
      getInitialState: function() {
        var tabs = bp.tabs;
        return {
          tabs: tabs,
          highlightedId: tabs[0].id,
          matches: null
        };
      },
      handleInput: function(input) {
        this.setState(input);
      },
      handleMouseEnterListItem: function(newHighlightedId) {
        this.setState({ highlightedId: newHighlightedId });
      },
      handleCloseTab: function(oldHighlightedId, index) {
        var newMatches = null;
        if (this.state.matches != null) {
          newMatches = [];
          for (var i = 0; i < this.state.matches.length; i++) {
            if (i !== index) {
              newMatches.push(this.state.matches[i]);
            }
          }
        }

        var newTabs = [];
        if (this.state.tabs) {
          for (var j = 0; j < this.state.tabs.length; j++) {
            if (j !== index) {
              newTabs.push(this.state.tabs[j]);
            }
          }
        }

        var newIndex = index;
        if (newIndex >= newTabs.length) {
          --newIndex;
        }

        this.setState({
          tabs: newTabs,
          highlightedId: newTabs.length ? newTabs[newIndex].id : null,
          matches: newMatches
        });
      },
      componentDidMount: function() {
        document.addEventListener('keydown', this.handleKeyDown);
        var _this = this;
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          var newTabs = [];
          if (request.event === 'tabUpdated') {
            newTabs = _this.state.tabs.map(function(tab, index, arr) {
              if (request.tab.id === tab.id) {
                return request.tab;
              } else {
                return tab;
              }
            });

            _this.setState({ tabs: newTabs });
          } else if (request.event === 'tabRemoved') {
            if (!bp.tabs.length) {
              window.close();
            }
          }

        });
      },
      componentWillUnmount: function() {
        document.removeEventListener('keydown', this.handleKeyDown);
      },
      handleKeyDown: function(event) {
        var KeyCode = {
          ENTER: 13,
          DOWN: 40,
          UP: 38,
          J: 74,
          K: 75,
          D: 68,
          DELETE: 46,
          ESC: 27
        };

        var i;

        if (event.keyCode === KeyCode.ENTER) {
          id = parseInt($('.highlighted').attr('id'), 10);
          chrome.tabs.get(id, function(tab) {
            chrome.tabs.update(tab.id, {
              'active': true,
              'highlighted': true
            });
            chrome.windows.update(tab.windowId, {
              'focused': true
            });
          });

        // move highlighted selection up
        } else if ((event.keyCode == KeyCode.UP)
            || (event.metaKey && event.keyCode == KeyCode.K)
            || (event.ctrlKey && event.keyCode == KeyCode.K)) {

          event.preventDefault();
          event.stopPropagation();

          var nextId;
          for (i = 0; i < this.state.tabs.length; i++) {
            if (this.state.highlightedId === this.state.tabs[i].id) {
              if (i - 1 >= 0) {
                nextId = this.state.tabs[i - 1].id;
              } else {
                nextId = this.state.tabs[this.state.tabs.length - 1].id;
              }
              break;
            }
          }
          this.setState({
            highlightedId: nextId
          });

        // move highlighted selection down
        } else if ((event.keyCode == KeyCode.DOWN)
                  || (event.metaKey && event.keyCode == KeyCode.J)
                  || (event.ctrlKey && event.keyCode == KeyCode.J)) {

          event.preventDefault();
          event.stopPropagation();

          var nextId;
          for (i = 0; i < this.state.tabs.length; i++) {
            if (this.state.highlightedId === this.state.tabs[i].id) {
              if (i + 1 < this.state.tabs.length) {
                nextId = this.state.tabs[i + 1].id;
              } else {
                nextId = this.state.tabs[0].id;
              }
              break;
            }
          }
          this.setState({
            highlightedId: nextId
          });

        // remove tab
        } else if ((event.metaKey && (event.keyCode == KeyCode.D))
                || (event.ctrlKey && event.keyCode == KeyCode.D)
                || (event.keyCode == KeyCode.DELETE)) {

          event.preventDefault();
          event.stopPropagation();
          document.querySelector('.highlighted .close-btn').click();

        // close popup
        } else if (event.keyCode === KeyCode.ESC) {
          if (bp.popupWindowId != null) {
            chrome.windows.remove(bp.popupWindowId, function() {
              bp.popupWindowId = null;
            });
          }
        }

      },
      render: function() {
        return (
          <div id='app'>
            <SearchBox onInput={this.handleInput}/>
            <TabList
              app={this}
              data={this.state.tabs}
              highlightedId={this.state.highlightedId}
              matches={this.state.matches}
              onCloseTab={this.handleCloseTab}
              onMouseEnterListItem={this.handleMouseEnterListItem} />
          </div>
        );
      }
    });

    // start app
    React.renderComponent(<App />, document.body);
  };
})(window);
