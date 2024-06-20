const path = require('path');
const mkdirp = require('mkdirp');
const codeBlocks = require('gfm-code-blocks');
const fs = require('fs');
const hljs = require('highlight.js');

function getAssets() {
    return {
        css: ['codetab/codetab.css'],
        js: ['codetab/codetab.js']
    };
}

function syncFile(book, outputDirectory, outputFile, inputFile) {
    outputDirectory = path.join(book.output.root(), '/gitbook/gitbook-plugin-gbook-codetab/' + outputDirectory);
    outputFile = path.resolve(outputDirectory, outputFile);
    inputFile = path.resolve(__dirname, inputFile);
    mkdirp.sync(outputDirectory);

    try {
        fs.writeFileSync(outputFile, fs.readFileSync(inputFile));
    } catch (e) {
        console.warn('Failed to write ' + inputFile);
        console.warn(e);
    }

}

function createTabHeader(title, i, isActive) {
    return '<div class="tab' + (isActive ? ' active' : '') + '" data-codetab="' + i + '">' + title + '</div>';
}

function createTabBody(i, language, data) {
    let isActive = i == 0;
    return '<div class="tab' + (isActive ? ' active' : '') + '" data-codetab="' + i + '"><pre><code class="lang-' + language + '">' +
        data +
        '</code></pre></div>';
}

module.exports = {
    book: getAssets,
    hooks: {
        init: function() {
            var book = this;
            syncFile(book, 'codetab', 'codetab.js', './codetab/codetab.js');
            syncFile(book, 'codetab', 'codetab.css', './codetab/codetab.css');
        },
    },
    blocks: {
        codetab: function(content) {
            console.log('mycodetab:', content)

            const reg = /([a-zA-Z]+)[ \t]*(?:{([a-zA-Z0-9]+)})?/

            const mBlock = new Map()

            let index =  Date.now() * 1000;
            codeBlocks(content.body).map(({
                lang,
                code
            }) => {
                const res = lang.match(reg)
                var key = ''
                if (res[2]) {
                    key = res[2]
                }else{
                    key = index++
                }
                
                let resCode = code.trim()
                if (mBlock.has(key)){
                    let srcCode = mBlock.get(key).code;
                    resCode = srcCode + "\n" + code
                }
                mBlock.set(key, {
                    lang: res[1],
                    code: resCode
                })
            })
            console.log('mBlock:', mBlock)
            let result = '<div class="codetabs">';
            let tabsHeader = '';
            let tabsContent = '';
            let i = 0
            mBlock.forEach(({lang, code}) => {
                tabsHeader += createTabHeader(lang, i, i == 0);
                const data = hljs.highlight(code,{language: lang}).value
                tabsContent += createTabBody(i,lang, data);
                i++
            })

            result += '<div class="codetabs-header">' + tabsHeader + '</div>';
            result += '<div class="codetabs-body">' + tabsContent + '</div>';
            result += '</div>';
            console.log('result:', result)
            return result;
        }
    }
}