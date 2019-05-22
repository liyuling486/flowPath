
var dragData = [];
var direction = ['top', 'right', 'bottom', 'left'];

var dirCH = {
    'top': '上',
    'right': '右',
    'bottom': '下',
    'left': '左'
}
var color = ['#000000', '#1393AA', '#3073C1', '#A13E52', '#31A068'];
var STATUS = {};     // 设备连接状态
var delLine = {};   // link, linked
var layer, layerIndex;
var LINEITEM = [];      // [['M100', '10', 'H200', 'V20'], '#000', intype, outype]
var numColor = {};
var point = {x:{}, y:{}}

var dClient = $("#flow").offset().top;
var dLeft = $("#flow").offset().left;
var width = 280;
var height = 100;
var spaceX = 100;
var spaceY = 100;
var lineSpace = 4;  // 如果线重叠  向后移动  / px
var turnSpace = 40;

layui.use(['layer', 'form'], function () {
    layer = layui.layer;
    form = layui.form;

    setTimeout(function () {
        init();
    }, 1000)

    form.on('checkbox(lineDeleteBox)', function (data) {
        var linkName = $('.macName span').text();
        var inType = data.elem.attributes['data-inType'].value;
        var outType = data.elem.attributes['data-outType'].value;
        var linkedName = data.elem.name;

        if (data.elem.checked) {
            $.each(dragData, function (i, v) {
                if (v.name == linkName) {
                    $.each(v.link, function (i1, v1) {
                        if (v1.inType == inType && linkedName == v1.linkedName && outType == v1.outType) {
                            if (!delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType]) {
                                delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType] = []
                            }
                            delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType][0] = v1;
                            delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType][0] = v1;
                        }
                    })
                }
                if (v.name == linkedName) {
                    $.each(v.linked, function (i1, v1) {
                        if (v1.type == inType && linkName == v1.linkName && outType == v1.type1) {
                            if (!delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType]) {
                                delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType] = []
                            }
                            delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType][1] = v1;
                        }
                    })
                }
            })
        } else {
            delete delLine[linkName + '|' + linkedName + '|' + inType + '|' + outType]
        }
    });
})

function init() {
    var displayDevice = $('.display-device li:visible');
    $.each(displayDevice, function (i, v) {
        v.ondragstart = function (ev) {
            drag(this.innerHTML, this.dataset.name, 'outside');
            var ev = ev || window.event;
            ev.dataTransfer.setData('name', 'lili');
        }
    })
}

function countPoint(res){  // 提取坐标点
    var start = {
        x: res.split(' ').slice(0, 2)[0].slice(1),
        y: res.split(' ').slice(0, 2)[1]
    }
    var end = res.split(' ').slice(2);
    var a = [];
    var x,y;

    $.each(end, function (i, v) {
        if (v.substr(0, 1) == "H") {
            if (i == 0) {
                y = start.y;
            } else {
                x = end[i - 1].slice(1);
            }
            x = v.slice(1);
        } else {
            if (i == 0) {
                x = start.x;
            } else {
                x = end[i - 1].slice(1);
            }
            y = v.slice(1);
        }
        if(i == end.length - 1){
            return false;
        }
        a.push([x, y]);
    })
    return lineRepeat(a, res);
}

function lineRepeat(data, res){   // 判断线是否重合
    var html = res.split(' ');
    var isRepeat = false;
    var area = 0;
    var dataX = [];
    var dataY = [];

    $.each(data, function(i, v){
        if(i > 0){
            areaNum = 0;
            if(v[0] == data[i - 1][0]){

                area = Math.floor(v[0] / (width + spaceX));
                if(Object.keys(point.x).indexOf(String(v[0])) > -1 && area == point.x[v[0]][2]){

                    html[1 + i] = 'H' + (parseInt(v[0]) + lineSpace);
                    isRepeat = true;
                }else{
                    dataX = [v[0], [v[1], data[i - 1][1], area]];
                }
            } else if(v[1] == data[i - 1][1]){

                area = Math.floor(v[1] / (height + spaceY));
                if(Object.keys(point.y).indexOf(String(v[1])) > -1 && area == point.y[v[1]][2]){
                    
                    html[1 + i] = 'V' + (parseInt(v[1]) + lineSpace);
                    isRepeat = true;
                }else{
                    dataY = [v[1], [v[0], data[i - 1][0], area]];
                }
            }
        }
    })
    
    if(isRepeat) {
        return countPoint(html.join(' '));
    }else{
        if(dataX.length > 0) point.x[dataX[0]] = dataX[1]
        if(dataY.length > 0) point.y[dataY[0]] = dataY[1]
    }

    return html.join(' ');
}


function links(data, index, datas) { // 线的走向
    var MHtml = 'M' + data.outx + ' ' + data.outy + ' ';
    var html = '';
    var countHtml = '';
    var index = index * 12;
    var dis = turnSpace + index;
    var arrow = 10;
    if (data.outType == 'bottom') {
        if (data.inType == 'bottom') {
            if (data.outy == data.iny) {
                html = 'V' + (data.outy + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
            } else if (data.outx == data.inx) {
                if (data.outy > data.iny) {
                    html = 'V' + (data.outy + dis) + ' H' + (datas.x - dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
                } else {
                    html = 'V' + (data.outy + dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
                }
            } else if (data.outx < data.inx) {
                html = 'V' + (data.outy + dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
            } else {
                html = 'V' + (data.outy + dis) + ' H' + (datas.x - dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
            }
        } else if (data.inType == 'left') {
            html = 'V' + (data.outy + dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
        } else if (data.inType == 'right') {
            html = 'V' + (data.outy + dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
        } else {
            if (data.iny - data.outy <= spaceY && data.iny - data.outy > 0) {
                if (data.outx == data.inx) {
                    html = 'V' + (data.iny - arrow);
                } else {
                    html = 'V' + (data.outy + dis) + ' H' + data.inx + ' V' + (data.iny - arrow)
                }
            } else {
                if (data.outx < data.inx) {
                    html = 'V' + (data.outy + dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
                } else {
                    html = 'V' + (data.outy + dis) + ' H' + (datas.x - dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
                }
            }
        }
    } else if (data.outType == 'top') {
        if (data.inType == 'top') {
            if (data.outy == data.iny) {
                html = 'V' + (data.outy - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
            } else if (data.outx == data.inx) {
                if (data.outy > data.iny) {
                    html = 'V' + (data.outy - dis) + ' H' + (datas.x - dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
                } else {
                    html = 'V' + (data.outy - dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
                }
            } else if (data.outx < data.inx) {
                html = 'V' + (data.outy - dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
            } else {
                html = 'V' + (data.outy - dis) + ' H' + (datas.x - dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
            }
        } else if (data.inType == 'left') {
            html = 'V' + (data.outy - dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
        } else if (data.inType == 'right') {
            html = 'V' + (data.outy - dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
        } else {
            if (data.outy - data.iny <= spaceY && data.outy - data.iny > 0) {
                if (data.outx == data.inx) {
                    html = 'V' + (data.iny + arrow);
                } else {
                    html = 'V' + (data.outy - dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
                }
            } else {
                if (data.outx > data.inx) {
                    html = 'V' + (data.outy - dis) + ' H' + (datas.x - dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
                } else {
                    html = 'V' + (data.outy - dis) + ' H' + (datas.x + width + dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
                }
            }
        }
    } else if (data.outType == 'left') {
        if (data.inType == 'left') {
            if (data.outx == data.inx) {
                html = 'H' + (data.outx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
            } else if (data.outy == data.iny) {
                if (data.outx > data.inx) {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y - dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                } else {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                }
            } else if (data.outx < data.inx) {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y - dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                } else {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                }
            } else {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y - dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                } else {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                }
            }
        } else if (data.inType == 'top') {
            html = 'H' + (data.outx - dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow)
        } else if (data.inType == 'bottom') {
            html = 'H' + (data.outx - dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow)
        } else {
            if (data.outx - data.inx <= spaceX && data.outx - data.inx > 0) {
                if (data.outy == data.iny) {
                    html = 'H' + (data.inx + arrow);
                } else {
                    html = 'H' + (data.outx - dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                }
            } else {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y - dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                } else {
                    html = 'H' + (data.outx - dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                }
            }
        }
    } else {
        if (data.inType == 'right') {
            if (data.outx == data.inx) {
                html = 'H' + (data.outx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
            } else if (data.iny == data.outy) {
                if (data.outx > data.inx) {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y - dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                } else {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                }
            } else if (data.outx < data.inx) {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y - dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                } else {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                }
            } else {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y - dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                } else {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx + dis) + ' V' + data.iny + ' H' + (data.inx + arrow);
                }
            }
        } else if (data.inType == 'top') {
            html = 'H' + (data.outx + dis) + ' V' + (data.iny - dis) + ' H' + data.inx + ' V' + (data.iny - arrow);
        } else if (data.inType == 'bottom') {
            html = 'H' + (data.outx + dis) + ' V' + (data.iny + dis) + ' H' + data.inx + ' V' + (data.iny + arrow);
        } else {
            if (data.inx - data.outx <= spaceX && data.inx - data.outx > 0) {
                if (data.iny == data.outy) {
                    html = 'H' + (data.inx - arrow);
                } else {
                    html = 'H' + (data.outx + dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                }
            } else {
                if (data.outy > data.iny) {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y - dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                } else {
                    html = 'H' + (data.outx + dis) + ' V' + (datas.y + height + dis) + ' H' + (data.inx - dis) + ' V' + data.iny + ' H' + (data.inx - arrow);
                }
            }
        }
    }
    
    countHtml = countPoint(MHtml + html);
    
    return [countHtml, data.color];
}

function reload() {
    $(function () {
        var html = "";
        var g = "";
        var lineCrossHtml = "";
        var circle = '';
        var crossHtml = '';

        LINEITEM = [];
        numColor = {};
        point = {x:{}, y:{}};

        sessionStorage.setItem('dragData', JSON.stringify(dragData));
        if ($('svg').siblings()) {
            var prev = $('svg').siblings();
            $.each(prev, function (i, v) {
                v.remove();
            })
        }
        $.each(dragData, function (i, v) {
            if (v != undefined) {
                var data = v;
                html +=
                    `<li class = "${data.name}" data-id = "${data.id}" data-label = "${data.label}" ondragstart = "insideDrag(this)"  draggable = "true" style = "transform:translate(${data.x}px,${data.y}px)">
                        <span class="text" data-id = "${data.id}">${data.label}</span>
                        <div class = "input leftCir" data-type="left" data-num="${data.left.num}" ></div>
                        <div class = "input rightCir" data-type="right" data-num="${data.right.num}"></div>
                        <div class = "input top" data-type="top" data-num="${data.top.num}"></div>
                        <div class = "input bottom" data-type="bottom" data-num="${data.bottom.num}"></div>
                        <i class="deleteIcon"></i>
                    </li>`
                if (data.link.length > 0) {
                    $.each(data.link, function (i1, v1) {
                        var line = links(v1, v1.num, data);

                        LINEITEM.push([line[0], color[line[1]], v1.inType, v1.outType, v.sign])
                        lineCrossHtml = lineCross(line[0], color[line[1]], v1.inType, v1.outType, v.sign);
                        circle += lineCrossHtml.circle;
                        crossHtml += lineCrossHtml.indexHtml;

                        g += `<g class = "${v1.name}">
                            <path d="${line[0]}" marker-end="url(#Triangle${line[1]})" style="stroke:${color[line[1]]};" data-name="${data.label}" data-color="${line[1]}"/>
                        </g>`
                    })
                }
            }
        })

        var marker = '';

        for (var i = 0; i < 5; i++) {
            marker += `<marker id="Triangle${i}" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto" style="stroke:${color[i]};" >
                            <path d="M 0 0 L 10 5 L 0 10 z" />
                        </marker>`
        }
        $('svg').before(html + crossHtml);
        $('svg').html(marker + g + circle);
    })
}

function lineCross(data, color1, inType, outType, sign) {  // 判断线交叉
    var start = {
        x: parseInt(data.split(' ')[0].slice(1)),
        y: parseInt(data.split(' ')[1])
    }

    var end = data.split(' ').slice(2)
    var a = {};
    var b = {};
    var p1 = {};
    var p2 = {};
    var x1, x2, y1, y2, arc = 0;
    var fin = {};
    var fin1 = {};
    var obj = {};
    obj.circle = '';
    obj.indexHtml = '';
    var lineSignIn = {
        'top': [6, -10],
        'right': [-10, -20],
        'bottom': [6, -10],
        'left': [-10, -20]
    }
    var lineSignOut = {
        'top': [0, -20],
        'right': [0, -20],
        'bottom': [0, 0],
        'left': [-20, -20]
    }

    $.each(end, function (i, v) {
        if (v.substr(0, 1) == "H") {
            if (i == 0) {
                a.y = start.y;
            } else {
                a.x = end[i - 1].slice(1);
            }
            a.x = v.slice(1);
        } else {
            if (i == 0) {
                a.x = start.x;
            } else {
                a.x = end[i - 1].slice(1);
            }
            a.y = v.slice(1);
        }
        if (i == 0) {
            p1.x = start.x;
            p1.y = start.y;
        } else {
            p1.x = b.x;
            p1.y = b.y;
        }
        p2.x = a.x;
        p2.y = a.y;
        b.x = a.x
        b.y = a.y

        $.each(LINEITEM, function (i1, v1) {
            var newData = v1[0];
            var newColor = v1[1];
            if (color1 == newColor) {
                if (newData && newData != data) {
                    var start1 = {
                        x: parseInt(newData.split(' ')[0].slice(1)),
                        y: parseInt(newData.split(' ')[1])
                    }
                    var end1 = newData.split(' ').slice(2)
                    var a1 = {};
                    var b1 = {};
                    var p3 = {};
                    var p4 = {};
                    $.each(end1, function (i2, v2) {
                        if (v2.substr(0, 1) == "H") {
                            if (i2 == 0) {
                                a1.y = start1.y;
                            } else {
                                a1.x = end1[i2 - 1].slice(1);
                            }
                            a1.x = v2.slice(1);
                        } else {
                            if (i2 == 0) {
                                a1.x = start1.x;
                            } else {
                                a1.x = end1[i2 - 1].slice(1);
                            }

                            a1.y = v2.slice(1);

                        }
                        if (i2 == 0) {
                            p3.x = start1.x;
                            p3.y = start1.y;
                        } else {
                            p3.x = b1.x;
                            p3.y = b1.y;
                        }
                        p4.x = a1.x;
                        p4.y = a1.y;
                        b1.x = a1.x
                        b1.y = a1.y

                        // console.log('p1: ' + JSON.stringify(p1) + ' p2: ' + JSON.stringify(p2) + ' p3: ' + JSON.stringify(p3) + ' p4: ' + JSON.stringify(p4))

                        if (segmentsIntr(p1, p2, p3, p4)) {
                            if(end1[end1.length - 1][0] == 'V'){
                                if(end1.length == 1){
                                    fin.x = start1.x
                                    fin.y = end1[0].slice(1)
                                }else{
                                    fin.x = end1[end1.length - 2].slice(1)
                                    fin.y = end1[end1.length - 1].slice(1)
                                }
                            }else{
                                if(end1.length == 1){
                                    fin.x = end1[0].slice(1)
                                    fin.y = start1.y
                                }else{
                                    fin.x = end1[end1.length - 1].slice(1)
                                    fin.y = end1[end1.length - 2].slice(1)
                                }
                            }
                            if(end[end.length - 1][0] == 'V'){
                                if(end.length == 1){
                                    fin1.x = start.x
                                    fin1.y = end[0].slice(1)
                                }else{
                                    fin1.x = end[end.length - 2].slice(1)
                                    fin1.y = end[end.length - 1].slice(1)
                                }
                            }else{
                                if(end.length == 1){
                                    fin1.x = end[0].slice(1)
                                    fin1.y = start.y
                                }else{
                                    fin1.x = end[end.length - 1].slice(1)
                                    fin1.y = end[end.length - 2].slice(1)
                                }
                            }   
                            fin.x = parseInt(fin.x)
                            fin.y = parseInt(fin.y)
                            
                            fin1.x = parseInt(fin1.x)
                            fin1.y = parseInt(fin1.y)
                            


                            // 线标开始
                            if(!numColor[color1]){
                                numColor[color1] = [{x: (start1.x + lineSignOut[v1[3]][0]), y: (start1.y + lineSignOut[v1[3]][1])}];
                                obj.indexHtml += '<i style="z-index: 9999999;color: ' + color1 + ' ;position: absolute;left: ' + (start1.x + lineSignOut[v1[3]][0]) + 'px;top: ' + (start1.y + lineSignOut[v1[3]][1]) + 'px">' + (v1[4] + numColor[color1].length) + '</i><i style="z-index: 9999999;color: ' + color1 + ' ;position: absolute;left: ' + (fin.x + lineSignIn[v1[2]][0]) + 'px;top: ' + (fin.y + lineSignIn[v1[2]][1]) + 'px">' + (v1[4] + numColor[color1].length) + '</i>'
                            }
                            if(numColor[color1].filter(function(res){
                                return res.x == (start.x + lineSignOut[outType][0]) && res.y == (start.y + lineSignOut[outType][1])
                            }).length == 0){
                                
                                numColor[color1].push({x:(start.x + lineSignOut[outType][0]), y: (start.y + lineSignOut[outType][1])})

                                obj.indexHtml += '<i style="z-index: 9999999;color: ' + color1 + ' ;position: absolute;left: ' + (start.x + lineSignOut[outType][0]) + 'px;top: ' + (start.y + lineSignOut[outType][1]) + 'px">' + (sign + numColor[color1].length) + '</i><i style="z-index: 9999999;color: ' + color1 + ' ;position: absolute;left: ' + (fin1.x + lineSignIn[inType][0]) + 'px;top: ' + (fin1.y + lineSignIn[inType][1]) + 'px">' + (sign + numColor[color1].length) + '</i>'
                            }
                            // 线标结束
                                
                            var str = segmentsIntr(p1, p2, p3, p4);
                            arc = 0;
                            if (v.substr(0, 1) == 'H') {
                                x1 = str.x - 3
                                x2 = str.x + 3
                                y1 = y2 = str.y + 1.1;
                            } else {
                                x1 = x2 = str.x - 1.1;
                                y1 = str.y - 3
                                y2 = str.y + 3
                            }
                            
                            // 线交点的圈圈
                            if((p1.x == p3.x || p1.y == p3.y) || (p1.x == p4.x || p1.y == p4.y)){
                                obj.circle += ''
                            }else if((p2.x == p3.x || p2.y == p3.y) || (p2.x == p4.x || p2.y == p4.y)){
                                obj.circle += ''
                            }else{
                                obj.circle += `<path d="M${x1} ${y1} A 3 3 ${arc} 1 1 ${x2} ${y2}" stroke="${color1}" stroke-width="2" fill="#F2F4F5" fill-opacity="1"/>`
                            }
                        }
                    })

                }
            }
        })
    })
    return obj
}

function lineDelete(data) { //  删除线
    var html = '';
    var deletePos = {
        top: [],
        right: [],
        bottom: [],
        left: []
    }
    $.each(data.link, function (i, v) {
        if (v.linkedId) {
            deletePos[v.outType].push(v);
        }
    })

    html += `<div class="layer-title">删除连线</div>
            <div class="closeBtn"></div>
            <span class="titleSplit"></span>
            <div class="macName">
                <span>${data.name}</span>
            </div>
            <div class="macContent layui-form">`

    $.each(deletePos, function (i, v) {
        var dir = '';

        dir = dirCH[i];

        if (v.length > 0) {
            html += `<div class="dic" data-type="${i}">
                        <p>${dir}侧</p>
                        <ul class="macLine">`
            $.each(v, function (i1, v1) {
                html += `<li>
                            <div class="sign sign${v1.color}"></div>
                            <div class="linkName" data-id="${v1.linkedId}">${v1.linkedName}</div>
                            <input type="checkbox" name="${v1.linkedName}" data-inType="${v1.inType}" data-outType="${i}" title="" lay-skin="primary" lay-filter="lineDeleteBox">
                        </li>`
            })
            html += `</ul>
                </div>`
        }

    })
    html += `</div>`
    if ($('#look').attr('data-type') == 1) {      // 不可以双击
        layer.open({
            type: 1,
            area: ['270px', '406px'],
            skin: 'lineDelete', //样式类名
            title: 0,
            btn: ['取消', '删除'],
            closeBtn: 0,
            content: html,
            success: function (layero, index) {
                layerIndex = index;
            },
            btn2: function (layero, index) {
                $.each(delLine, function (i2, v2) {
                    $.each(dragData, function (i1, v1) {
                        $.each(direction, function (i3, v3) {
                            $.each(v1[v3], function (i4, v4) {

                                if (v2[0] == v4) {
                                    v1[v3][i4] = {};
                                    return true;
                                }
                                if (v2[1] == v4) {
                                    v1[v3][i4] = {};
                                }
                            })
                        })
                    })
                    judgeIndex();
                    $.each(dragData, function (i1, v1) {
                        changePos(v1);
                    })
                })
                delLine = {};
                reload();
            }
        })
        form.render();
    }
}

function connection(name, id, type, dx, dy) {

    if ($.isEmptyObject(STATUS)) {    // 判断 STATUS 是否为空对象
        $.each(dragData, function (i, v) {
            if (v.name == name) {
                if (v.link.length < 5) {
                    STATUS = {
                        lineName: id + name,
                        name: name,
                        id: id,
                        outType: type,
                        outx: dx,
                        outy: dy,
                    }

                    $('.' + name + ' .input').css('z-index', '50');
                    $('.' + name + ' .input[data-type=' + type + ']').css('z-index', '100');
                    $('.' + name + ' .input[data-type=' + type + ']').css('background-color', '#38A8E9');
                } else {
                    layer.msg('每台设备最多连接五台设备')
                }
            }
        })
    } else {
        for (var i = 0; i < dragData.length; i++) {
            for (var j = 0; j < dragData[i].linked.length; j++) {
                if (name != STATUS.name) {
                    if (dragData[i].linked[j].linkName == STATUS.name && dragData[i].name == name && dragData[i].linked[j].type == type && dragData[i].linked[j].type1 == STATUS.outType) {
                        layer.msg('同一台设备的同一个方向， 不可连接两次');
                        return
                    }
                }
            }
        }

        if (name != STATUS.name) {    // 判断不是同一台设备

            STATUS.lineName = STATUS.lineName + '|' + id + name;
            STATUS.inType = type;
            STATUS.inx = dx;
            STATUS.iny = dy;
            STATUS.linkedName = name;
            STATUS.linkedId = id;
            $.each(dragData, function (i, v) {
                if (v.name == name) {
                    v[type][v[type].num] = {
                        name: STATUS.id + STATUS.name + '|' + id + name,
                        type: type,
                        linkName: STATUS.name,
                        type1: STATUS.outType
                    }
                    v[type].num++;
                }
                if (STATUS.name == v.name) {
                    STATUS.color = v.link.length
                    v[STATUS.outType][v[STATUS.outType].num] = STATUS;
                    v[STATUS.outType].num++;
                }
            })

            judgeIndex();
            reload();
        } else {  // 判断是同一台设备
        }
            clearStatus();
        STATUS = {};
    }
}

function judgeIndex() {
    $.each(dragData, function (i, v) {
        v.link = [];
        v.linked = [];

        $.each(direction, function (i1, v1) {
            for (var j = 0; j < 5; j++) {
                if (JSON.stringify(v[v1][j]) != '{}') {
                    if (isNaN(v[v1][j].id)) {
                        v.linked.push(v[v1][j]);
                    } else {
                        v.link.push(v[v1][j]);
                    }
                    v[v1][j].num = j
                }
            }

            if (JSON.stringify(v[v1][v[v1].num]) != '{}') {
                for (var k = 0; k < 5; k++) {
                    
                    if (JSON.stringify(v[v1][k]) == '{}') {
                        v[v1].num = k;
                        break;
                    }
                    if(k == 4){
                        v[v1].num = 5
                    }
                } 
            }
        })
    })
}

/**
* 拖拽事件
* @param {string} word - 名称
* @param {string} name - 名称 ——> ID
* @param {string} type - outside / inside
* @param {number} id -  设备id
*/
function drag(word, name, type, id) {
    // $('svg').css('background', 'url(images/flowPath/drag_bg.png)');
    STATUS = {};
    if (dragData.length != 0) {
        $('.firstDragTip').hide();
    }
    document.getElementById('left').ondrop = function (e) {
        var x;
        var y;
        var box = $("#left");
        var p = [];
        var sign = 'a';
        var position = [];

        if(dragData.length > 0){
            var str = dragData[dragData.length - 1].sign;
            sign = String.fromCharCode(str.charCodeAt() + 1)
        }
        // $('svg').css('background', 'none');
        
        position = [Math.floor((e.clientX - dLeft + box.scrollLeft()) / (spaceX + width)), Math.floor((e.clientY - dClient + box.scrollTop()) / (spaceY + height))]

        p = changeSpace(position[0], position[1]);
        x = p[0];
        y = p[1];

        if (dragData.length == 0) {
            $('.firstDragTip').css('top', y + 80 + 100 + 20)
            $('.firstDragTip').css('left', x + 200)
            $('.firstDragTip').show();
        }

        for (var i = 0; i < dragData.length; i++) { // 判断是否重叠
            if (dragData[i].x == x && dragData[i].y == y && dragData[i].id != id && dragData[i].name != name) {
                layer.msg('请不要重叠设备');
                return;
            }
        }
        if (type == "outside") {    // 外向里 拖动
            dragData.push({
                id: dragData.length,
                position: position,
                sign: sign,
                label: word,    // 中文设备名
                name: name,     // 标识  id
                x: x,
                y: y,
                link: [],
                linked: [],
                draw: false,
                top: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    num: 0
                },
                right: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    num: 0
                },
                bottom: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    num: 0
                },
                left: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    num: 0
                }
            });
            $('li[data-name=' + name + ']').hide();
            reload();
        }
        if (type == "inside") {     // 在画布里拖动
            $.each(dragData, function (i, v) {
                if (id == v.id) {
                    v.x = x;
                    v.y = y;
                    changePos(v);
                }
            })
            judgeIndex();
            reload();
        }
    }
}

function lineSeat(type, data, num) {    // 连线的出入口位置判断
    var dx, dy;
    switch (type) {
        case 'left':
            dx = data.x;
            dy = data.y + (num + 1) * 18;
            break;
        case 'right':
            dx = data.x + width;
            dy = data.y + (num + 1) * 18;
            break;
        case 'top':
            dx = data.x + (num + 1) * 46;
            dy = data.y;
            break;
        case 'bottom':
            dx = data.x + (num + 1) * 46;
            dy = data.y + height;
            break;
    }
    return [dx, dy]
}

function insideDrag(item) {
    drag(item.dataset.label, item.className, 'inside', item.dataset.id);
    var ev = window.event;
    ev.dataTransfer.setData('name', 'lili');
}

function changePos(data) {
    $.each(direction, function (i1, v1) {
        $.each(data[v1], function (i2, v2) {
            if (!isNaN(v2.id)) {
                seat = lineSeat(v1, data, parseInt(v2.num));

                v2.outx = seat[0];
                v2.outy = seat[1];
            } else {
                $.each(dragData, function (i3, v3) {
                    $.each(direction, function (i4, v4) {
                        $.each(v3[v4], function (i5, v5) {
                            if (v2.linkName == v3.name && v2.type == v5.inType && v2.type1 == v5.outType) {
                                if (!isNaN(v5.id) && v2.name == v5.lineName) {
                                    seat = lineSeat(v5.inType, data, parseInt(v2.num));

                                    v5.inx = seat[0];
                                    v5.iny = seat[1];
                                }
                            }
                        })
                    })
                })
            }
        })
    })
}

function segmentsIntr(a, b, c, d) {		// 判断线段是否相交

    /** 1 解线性方程组, 求线段交点. **/
    // 如果分母为0 则平行或共线, 不相交 
    var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
    if (denominator == 0) {
        return false;
    }

    // 线段所在直线的交点坐标 (x , y) 
    var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
        + (b.y - a.y) * (d.x - c.x) * a.x
        - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
    var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
        + (b.x - a.x) * (d.y - c.y) * a.y
        - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

    /** 2 判断交点是否在两条线段上 **/
    if (
        // 交点在线段1上 
        (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
        // 且交点也在线段2上 
        && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0
    ) {

        // 返回交点p 
        return {
            x: x,
            y: y
        }
    }
    //否则不相交 
    return false
}
function changeSpace(x1, y1){   // 改变设备位置
    var x = 0;
    var y = 0;

    x = x1 * (spaceX + width);    // 固定位置
    y = y1 * (spaceY + height);

    x = x == 0 ? spaceX : (x + spaceX)     // 左侧留出 100 空隙
    y = y == 0 ? spaceY : (y + spaceY)     // 上面留出 100 空隙
    return [x, y];
}

function user(){    // 用户配置基本信息
    var p = [];
    $.each(dragData, function(i, v){
        p = changeSpace(v.position[0], v.position[1]);
        v.x = p[0];
        v.y = p[1];
        changePos(v);
    })
    reload();
}
function clearStatus(){ // 清空选中状态
    $('.input').css('background-color', 'transparent');
    STATUS = {};

    judgeIndex();
    reload();
}

document.getElementById('left').ondragover = function (e) {
    e.preventDefault();
}
$("svg").on("click", function (e) {
    $('#flow li').css('border-color', '#999');
    $('#flow li .deleteIcon').hide();
    clearStatus();
});
$('#config').on('click', function(){
    spaceX = parseInt($('#devSpaceX').val()) || 100;
    spaceY = parseInt($('#devSpaceY').val()) || 100;
    lineSpace = parseInt($('#lineSpace').val()) || 4;
    turnSpace = parseInt($('#turnSpace').val() || 40);

    user();
})
$(document).on("mouseover", '.input', function (event) {
    $(this).siblings('.input').css('z-index', '50');
    $(this).css('z-index', '100');
    if(STATUS.name){
        $('.' + STATUS.name + ' .input[data-type=' + STATUS.outType + ']').css('z-index', 150)
    }
})

$(document).on('click', '.input', function (e) {
    e.stopPropagation();
    var name = $(this).parent().attr('class');
    var id = $(this).parent().attr('data-id');
    var type = $(this).attr('data-type');
    var num = parseInt($(this).attr('data-num'));
    var dx, dy;
    if (num < 5) {
        $.each(dragData, function (i, v) {
            if (v.name == name) {
                var seat = lineSeat(type, v, num);
                dx = seat[0];
                dy = seat[1];

                connection(name, id, type, dx, dy);
            }
        })
    } else {
        layer.msg('每台设备一个方向最多五台设备');
    }
})

$(document).on('click', '#flow li', function (e) {
    if ($('#look').attr('data-type') == 1) {
        $('#flow li').css('border-color', '#999');
        $('#flow li .deleteIcon').hide();

        $(this).css('border-color', '#f00');
        $(this).find('.deleteIcon').show();
    }
})

$(document).on('click', '#flow li .deleteIcon', function () {
    var $parent = $(this).parent();
    var $parentClass = $parent.attr('class');
    $.each(dragData, function (i, v) {    // 删除 dragData 设备
        if (v.name == $parentClass) {
            link = v.link ? true : false;
            dragData.splice(i, 1);
            $parent.remove();
            $('.type li[data-name=' + $parentClass + ']').show();
            sessionStorage.setItem('dragData', JSON.stringify(dragData));
            return false;
        }
    });
    $.each(dragData, function (i, v) {    // 删除相关连线  linked / link
        $.each(direction, function (i1, v1) {
            for (var j = 0; j < 5; j++) {
                if (JSON.stringify(v[v1][j]) != '{}') {
                    if (isNaN(v[v1][j].id)) {
                        if (v[v1][j].linkName == $parentClass) {
                            v[v1][j] = {};
                            judgeIndex();
                            changePos(v);
                        }
                    } else {
                        if (v[v1][j].linkedName == $parentClass) {
                            v[v1][j] = {};
                            judgeIndex();
                            changePos(v);
                        }
                    }
                }
            }
        })
    });
    reload();
    if(dragData.length == 0){
        // $('svg').css('background', 'url(images/flowPath/drag_bg.png)');
        $('.firstDragTip').hide();
    }
})

$(document).on('dblclick', '#flow li span.text', function (e) {
    var name = e.target.parentElement.attributes['data-label'].value;

    $.each(dragData, function (i, v) {
        if (v.name == name) {
            lineDelete(v);
            return false;
        }
    })
    e.stopPropagation();
})

$(document).on('click', '.closeBtn', function () {
    layer.close(layerIndex)
})

$('svg').mouseup(function (e) {
    $('svg').unbind('mousemove');
    for (var i = 0; i < dragData.length; i++) {
        dragData[i].draw = false;
        if (dragData[i].name == STATUS.name) {
            dragData[i].link.pop();

            $('#flow li').css('border-color', '#999');
            $('#flow li .deleteIcon').hide();
        }
    }
    STATUS = {};
})

