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

function DecodeDBE(content) {
    content = content.replace(/\\\{\\\{/, "\{\{")
    content = content.replace(/\\\}\\\}/, "\}\}")
    return content
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

function getTitleInfo(str) {
    if (/^{\w+}$/.test(str)){
        return {
            lang: str
        }
    }
    let validStr = str.replace(/([a-zA-Z_$][0-9a-zA-Z_$]*)\s*:/g, '"$1": ');
    validStr = validStr.replace(/'/g, '"');
    return JSON.parse("{" + validStr + "}")
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
            // console.log('codetab:', content)
            body = content.body
            // body = body.replace(/\\\{\\\{/, "\{\{")
            // body = body.replace(/\\\}\\\}/, "\}\}")
            // console.log('mycodetab:', body)

            const reg = /([a-zA-Z]+)[ \t]*(?:"{([_a-zA-Z0-9,:"' \u4e00-\u9fff]+)}")?/

            const mBlock = new Map()

            let index =  Date.now() * 1000;
            codeBlocks(body).map(({
                lang,
                code
            }) => {
                const res = lang.match(reg)
                // console.log("res:", res)
                lang = res[1].trim() 
                code = code.trim()
                let title = ''
                let key = index++
                let dbe = false
                if (res[2]) {
                    const info = getTitleInfo(res[2])
                    // console.log('info:', info)
                    if (info.group){
                        key = info.group
                    }
                    if (info.title) {
                        title = info.title
                    }
                    if (info.lang) {
                        lang = info.lang
                    }
                    if (info.dbe) {
                        dbe = info.dbe
                        code = DecodeDBE(code)
                    }
                }
                if (title === ''){
                    title = lang
                }
                
                if (mBlock.has(key)){
                    const srcBlock = mBlock.get(key)
                    let srcCode = srcBlock.code;
                    dbe = srcBlock.dbe
                    if (dbe) {
                        code = DecodeDBE(code)
                    }
                    code = srcCode + "\n\n" + code
                    lang = srcBlock.lang
                    title = srcBlock.title
                }
                mBlock.set(key, {
                    lang,
                    title,
                    code,
                    dbe
                })
            })
            // console.log('mBlock:', mBlock)
            let result = '<div class="codetabs">';
            let tabsHeader = '';
            let tabsContent = '';
            let i = 0
            mBlock.forEach(({lang, code, title}) => {
                tabsHeader += createTabHeader(title, i, i == 0);
                const data = hljs.highlight(code,{language: lang}).value
                tabsContent += createTabBody(i,lang, data);
                i++
            })

            result += '<div class="codetabs-header">' + tabsHeader + '</div>';
            result += '<div class="codetabs-body">' + tabsContent + '</div>';
            result += '</div>';
            // console.log('result:', result)
            return result;
        }
    }
}