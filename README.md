# gitbook-plugin-gbook-code-tab

thanks for [gitbook-plugin-prism-codetab-fox](https://www.npmjs.com/package/gitbook-plugin-prism-codetab-fox)

## demo

``````md
{% codetab %}

```js {group: "g1", title: "helloworld"}
console.log('hi')
console.log('hi-----')


console.log("good job")

console.log(1+2)
```

```js {group: "g1"}
console.log('+++++')
```

```go
fmt.Println("hi go")
```

```py {title: 'job py'}
print('xxxxx')
```

@import "testcode/11.ts" {group: 'g2'}
@import "testcode/1.ts" {group: 'g2'}

@import "testcode/1.py" {lang: 'go', title: 'not go is python'}

{% endcodetab %}
``````

说明：

- lang: 指定语言类型
- title: 给定tab标题，无则默认为对应语言类型
- group: 分组，可将同一分组合并到一格tab中
- 使用 @import 需要引入 [gbook-import-code](https://www.npmjs.com/package/gitbook-plugin-gbook-import-code)

## use in book.json

```json
{
  "plugins": ["gbook-codetab"]
}
```