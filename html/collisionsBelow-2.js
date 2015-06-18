define([
    'lib/domStuff'
  , 'lib/typoStuff'
], function(
    domStuff
  , typoStuff
){
    "use strict";
    /*global document:true*/

    var Glyph = typoStuff.Glyph
      , zwj = typoStuff.zwj
      , zwnj = typoStuff.zwnj
      , nbsp = typoStuff.nbsp
      , hasChar = typoStuff.hasChar
      , createElement = domStuff.createElement
      , makeTable = domStuff.makeTable
      , makeTableHead = domStuff.makeTableHead
      ;

    var first = [
            'uni0680.init'
          , 'uni0776.init'
          , 'uni06CE.init'
          , 'uni0775.init'
          , 'uni06BD.init'
          , 'uni064A.init'
          , 'uni067E.init'
          , 'uni0753.init'
          , 'uni0752.init'
          , 'uni063D.init'
          , 'uni0754.init'
          , 'uni06D1.init'
          , 'uni06CC.init'
          , 'uni0767.init'
          , 'uni0680.medi'
          , 'uni0776.medi'
          , 'uni0750.medi'
          , 'uni06CE.medi'
          , 'uni0775.medi'
          , 'uni06BD.medi'
          , 'uni064A.medi'
          , 'uni067E.medi'
          , 'uni0753.medi'
          , 'uni0752.medi'
          , 'uni063D.medi'
          , 'uni0754.medi'
          , 'uni06D1.medi'
          , 'uni06CC.medi'
          , 'uni0767.medi'
          , 'uni0680.init_High'
          , 'uni0776.init_High'
          , 'uni0750.init_High'
          , 'uni06CE.init_High'
          , 'uni0775.init_High'
          , 'uni06BD.init_High'
          , 'uni064A.init_High'
          , 'uni067E.init_High'
          , 'uni0753.init_High'
          , 'uni0752.init_High'
          , 'uni063D.init_High'
          , 'uni0754.init_High'
          , 'uni06D1.init_High'
          , 'uni06CC.init_High'
          , 'uni0767.init_High'
          , 'uni0680.medi_High'
          , 'uni0776.medi_High'
          , 'uni0750.medi_High'
          , 'uni06CE.medi_High'
          , 'uni0775.medi_High'
          , 'uni06BD.medi_High'
          , 'uni064A.medi_High'
          , 'uni067E.medi_High'
          , 'uni0753.medi_High'
          , 'uni0752.medi_High'
          , 'uni063D.medi_High'
          , 'uni0754.medi_High'
          , 'uni06D1.medi_High'
          , 'uni06CC.medi_High'
          , 'uni0767.medi_High'
          , 'uni064A.init_BaaYaaIsol'
          , 'uniFEF3'
          , 'u1EE29'
          , 'uniFB58'
          , 'uniFB5C'
          , 'uniFBFE'
        ].map(Glyph.factory)
        // if it says ≡ {unicode} {unicode}
        // I expect that opentype prevents that I ever see the original codepoint
        // let's see what happens
      , alefs = [
            'uni0627.fina' // ARABIC LETTER ALEF the normal alef.fina as used in kashida.fea we get there we are done
            // several alef combinations
          , 'uni0625.fina' // ARABIC LETTER ALEF WITH HAMZA BELOW ≡ 0627 0655    basics.fea sub uni0625 by uni0627.fina uni0655;
          , 'uni0774.fina' // ARABIC LETTER ALEF WITH EXTENDED ARABIC-INDIC DIGIT THREE ABOVE
          , 'uni0773.fina' // ARABIC LETTER ALEF WITH EXTENDED ARABIC-INDIC DIGIT TWO ABOVE
          , 'uni0623.fina' // ARABIC LETTER ALEF WITH HAMZA ABOVE ≡ 0627 0654
          , 'uni0622.fina' // ARABIC LETTER ALEF WITH MADDA ABOVE ≡ 0627 0653
          , 'uni0675.fina' // ARABIC LETTER HIGH HAMZA ALE ≈ 0627 + 0674
          , 'uni0672.fina' // ARABIC LETTER ALEF WITH WAVY HAMZA ABOVE

            // should be entered as \u0627 \u065F. if I enter this directly
            // \u0673 (which is discouraged by unicode, wwhbd what will harfbuzz do?)
            // "this character is deprecated and its use is strongly discouraged"
            // if it is normalized to \u0627 \u065F this will be easy
          , 'uni0673.fina' // ARABIC LETTER ALEF WITH WAVY HAMZA BELOW
          , 'uni0671.fina' // ARABIC LETTER ALEF WASLA with an alef above, Koranic Arabic

            // I don't care much about these. Where these codepoints are used
            // advanced typographical features are not known or not wanted.
            // maybe we should remove mentioning of these in the feature files,
            // it is rather over engineering to support these.
          , 'uniFB51'
          , 'uniFE82'
          , 'uniFE84'
          , 'uniFE88'
          , 'uniFE8E'
          , 'u1EE6F'
        ].map(Glyph.factory)
      , alefFina = Glyph.factory('uni0627.fina')
      , marksBelow = [
           'uni0655'
         , 'uni064D', 'uni08F2', 'uni064D.small' // TODO: remove .small ?
         , 'uni065F'
         , 'uni0650' , 'uni0650.small' , 'uni0650.small2'// TODO: remove .small .small2 ?
         , 'uni0656'
         , 'uni061A'
         , 'uni06ED'
         , 'uni065C'
         , 'uni0325'
         , 'uni08E6'
         , 'uni08E9'
        ].map(Glyph.factory)
      , kashida = Glyph.factory('uni0640')
      ;

    function main() {
        var body = createElement('article', null, [
            createElement('h1', null, 'Colisions of final Alef below the baseline.')
          , createElement('p', null, 'When a final Alef has a Mark below the baseline, '
                + 'we shouldn\'t produce collisions with the glyph before the Alef.')
          , createElement('p', null, 'Note that uniF{xxx} and u{xxxx} glyphs are not meant to '
                                    +'join properly with uni0{xxx} glyphs.')
        ]);


        var i,l, ii, ll, iii, lll
          , items = []
          , rows = []
          , cols
          , firstTypes = new Set(['init', 'medi', '_nocontext_'])
          , type, firstGlyph, alef, mark, input
          ;

        for(i=0,l=alefs.length;i<l;i++) {
                alef = alefs[i];
            rows.push(
                    createElement('tr', null,[
                        createElement('th', {dir:'LTR'}, 'glyph before')
                      , createElement('th', {dir:'LTR', colspan: (first.length + 2)}, 'Alef: ' + alef.name)
                ]));

            for(ii=0,ll=first.length;ii<ll;ii++) {
                firstGlyph = first[ii];
                type = firstGlyph.getType('_nocontext_');
                if(!firstTypes.has(type))
                    continue;
                cols = [];
                cols.push(createElement('th',  {dir:'LTR'}, firstGlyph.name));
                for(iii=0,lll=marksBelow.length;iii<lll;iii++) {
                    mark = marksBelow[iii];
                    input = [];
                    input.push(
                        nbsp
                      , firstGlyph.type === 'medi' ? zwj : ''
                      , firstGlyph.char
                      , alef.char
                      , mark.char
                    );
                    cols.push(createElement('td',  {title:'Mark: ' + mark.name}, input.join('')));
                }
                rows.push(createElement('tr', null, cols));
            }
       }
       body.appendChild(createElement('table', {dir: 'RTL', 'class': 'testcontent'}, rows));
       return body;
    }

    return {
        title: 'issue#6-2'
      , generate: main
    };
});