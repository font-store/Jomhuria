define([
    'lib/domStuff'
  , 'lib/typoStuff'
  , 'lib/Table'
  , 'lib/TableContent'
  , 'data/otClasses'
], function(
    domStuff
  , typoStuff
  , Table
  , TableContent
  , otClasses
){
    "use strict";
    /*global document:true*/

    var Glyph = typoStuff.Glyph
      , zwj = typoStuff.zwj
      , zwnj = typoStuff.zwnj
      , nbsp = typoStuff.nbsp
      , dottedCircle = typoStuff.dottedCircle
      , createElement = domStuff.createElement
      , createFragment = domStuff.createFragment
      , first, second, third
      ;

    first = [].concat(otClasses['aKaf.init'], otClasses['aKaf.medi'])
        .map(Glyph.factory);
    // otClasses['aLam.medi_LamAlfFina'] produces the same input
    // one is enough
    second = otClasses['aLam.medi'].slice() // make a copy
        .map(Glyph.factory);
    // otClasses['aAlf.fina_LamAlfFina'] produces the same input
    // one is enough
    third = otClasses['aAlf.fina'].slice() // make a copy
        .map(Glyph.factory);

    first.name = 'first glyph @aKaf.init + @aKaf.medi';
    second.name = 'second glyph @aLam.medi';
    third.name = 'third glyph @aAlf.fina';

        var axes = {
        _items: [first, second, third]
      , len: function(axisIndex) {
            return this._items[axisIndex].length;
        }
      , hasLabel: function (axisIndex) {
            var axis = this._items[axisIndex];
            return 'hasLabel' in axis ? !!axis.hasLabel : true;
        }
      , getData: function (firstIndex, secondIndex, thirdIndex) {
            var glyphs = [this._items[0][firstIndex]
                    , this._items[1][secondIndex]
                    , this._items[2][thirdIndex]
                ]
              , i,l
              , charString = []
              , content
              , title
              ;

            // firstIndex
            charString.push(glyphs[0].mainType === 'medi' ? zwj : zwnj, glyphs[0].char);
            // secondIndex
            charString.push(glyphs[1].char);
            // thirdIndex
            charString.push(glyphs[2].char, zwnj);

            content = charString.join('');
            title = glyphs.map(function(glyph){ return glyph.name; }).join(' + ');
            return [{dir: 'RTL', title: title}, content];
        }
        /**
         * `type`, string: one of 'section', 'row', 'column'
         */
      , getLabel: function (axisIndex, itemIndex, type) {
            var axis = this._items[axisIndex]
            , item = axis[itemIndex]
            , axisName = axis.name
            , attr = {dir: 'LTR'}
            , content, str, char
            ;
            attr.title = axisName + ': '+ item.name;
            if(axis.isMark)
                str = [dottedCircle, item.char, nbsp];
            else switch(item.mainType) {
                case 'init':
                    str = [nbsp, zwnj, item.char, zwj, nbsp];
                    break;
                case 'medi':
                    str = [nbsp, zwj, item.char, zwj, nbsp];
                    break;
                case 'fina':
                    str = [nbsp, zwj, item.char, zwnj, nbsp];
                    break;
                default:
                    str = [nbsp, zwnj, item.char, zwnj, nbsp];
            }
            char = createElement('span', {dir: 'RTL'},  str.join(''));
            switch (type) {
                case 'column':
                    // very short label
                    content = char;
                    break;
                // long labels
                case 'section':
                    content = axisName + ': ';
                    /* falls through */
                case 'row':
                    /* falls through */
                default:
                    content = (content && [content] || []).concat(item.name, char);
                break;
            }
            return [attr, createFragment(content)];
        }
    };

    function main() {
        /*jshint multistr:true*/
        var info = [
              createElement('h1', null, 'The Combination Kaf-Lam-Alf has special substitutions')
            , createElement('p', null, 'This is to test:')
            , createElement('pre', null, '  sub [@aKaf.init @aKaf.medi]\' lookup KafLam\n\
      [@aLam.medi @aLam.medi_LamAlfFina]\' lookup KafLamAlf\n\
      [@aAlf.fina @aAlf.fina_LamAlfFina];')
          ]
          , table = new Table(axes, [0, 1, 2]) //[sectionAxis, rowAxis, columnAxis]
          , state = new TableContent(info, table)
          ;
        return state.body;
    }

    return {
        title: 'issue#7-1'
      , generate: main
    };
});
