Mock.mock("/flowChart", "get", {
    "result": true,
    'data|7-13': [{
        'name': '@cword(3, 5)' + ' 流程',
        'img': '@dataImage("250x200", "流程图")'
    }],
});
