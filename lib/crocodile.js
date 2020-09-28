'use babel';

import { CompositeDisposable } from 'atom';

export default {

  crocodileView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up
    // with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'crocodile:generate_docs': () => this.generate_docs()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  formatDocstring(position, name, args, retVal, tab_type, tab_length) {
    let { column } = position;
    let numTabs = column / tab_length;

    let firstLine = `Brief description of ${name}`;

    let splitArgs = [];

    if (args) {
      splitArgs = args.split(',').map((el) => {
        let trimmedEl = el.trim();
        return [`${trimmedEl}`, `${tab_type}Brief description of ${trimmedEl}`];
      }).flat();
    }

    if (!retVal) {
      retVal = 'nil';
    }

    let startOfLine = `${tab_type.repeat(numTabs)}# `;

    let templateArgs = [
      firstLine,
      '',
      'Arguments',
      '---------',
      ...splitArgs,
      '',
      'Returns',
      '-------',
      retVal,
      '',
      'Examples',
      '--------',
    ].map((el, i) => {
      if (i === 0) {
        return `# ${el}`;
      }
      return `${startOfLine}${el}`;
    }).join('\n')

    return templateArgs;
  },

  generate_docs() {
    let editor;
    let docblock;
    let [tab_length, tab_type] = ['editor.tabLength', 'editor.softTabs']
      .map((q) => atom.config.get(q, {scope: ['source.crystal']}));
    tab_type = tab_type ? ' '.repeat(tab_length) : '\t';

    let fnRegex = new RegExp(''
      + /def\s(?:self\.)?(?<fname>[a-z][a-z0-9A-Z]+)/.source
      + /(?:\((?<fargs>(?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\))?/.source
      + /(?:\s\:\s(?<freturn>[^\s]+))?/.source, 'gm'
    );

    if (editor = atom.workspace.getActiveTextEditor()) {
      editor.moveToFirstCharacterOfLine();
      let pos = editor.getCursorBufferPosition();
      editor.selectToEndOfLine();
      let fnDefinition = editor.getSelectedText();
      let parsed = fnRegex.exec(fnDefinition);

      let [_, fnName, fnArgs, fnReturn] = parsed;

      let templateStr = this.formatDocstring(pos, fnName, fnArgs, fnReturn, tab_type, tab_length);
      editor.insertNewlineAbove();
      editor.insertText(templateStr);
    }
  }
};
