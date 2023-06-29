let map = L.map("map", {
    layers: L.tileLayer("http://58.215.121.58:6980/?z={z}&x={x}&y={y}"),
    //layers: L.tileLayer("http://58.215.121.58:9002/{z}/{x}/{y}.jpg"),
    //layers: L.tileLayer("https://www.hifleet.com/hifleetapi/getNauticalChart.do?z={z}&x={x}&y={y}&i18n=cn"),
    //layers: L.tileLayer("https://api1.niowx.com/sp/i4insights/v2/open/raster/map/{z}/{y}/{x}.png?v=i4insight&tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwMCwicm9sZSI6MjA0Nywic2NvcGUiOiJpbiIsImlhdCI6MTY2NzM3MDg5NSwiZXhwIjozODQ0NjUwODk1fQ.12IlCOpksbTUzbb9KM4O7JRGJIOI_tlyRW0L_GjSHfI"),
    //layers: L.tileLayer("https://api9.niowx.com/sp/i4insights/v2/open/raster/map/{z}/{y}/{x}.png?v=hifleet&tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwMCwicm9sZSI6MjA0Nywic2NvcGUiOiJpbiIsImlhdCI6MTY2NzM3MDg5NSwiZXhwIjozODQ0NjUwODk1fQ.12IlCOpksbTUzbb9KM4O7JRGJIOI_tlyRW0L_GjSHfI"),

    center: [31, 179],
    zoom: 8,
    minZoom: 3,
    maxZoom: 18,
});
L.control.scale({
    position: 'bottomleft',
    maxWidth: '100',
    imperial: false,
}).addTo(map);

{
    xiangroup = L.featureGroup([]); //创建图层
    let coordDIV = document.createElement('div');
    coordDIV.id = 'mapCoordDIV';
    coordDIV.style.position = 'absolute';
    coordDIV.style.bottom = '1px';
    coordDIV.style.left = '150px';
    coordDIV.style.zIndex = '900';
    coordDIV.style.color = '#404040';
    coordDIV.style.fontFamily = 'Times New Roman';
    coordDIV.style.fontSize = '15pt';
    coordDIV.style.backgroundColor = '#fff';
    document.getElementById('map').appendChild(coordDIV);

    map.addLayer(xiangroup);
    map.doubleClickZoom.disable();
    map.closePopupOnClick = false;
    let latlngs = []
    polyline = L.polyline(latlngs, {
        color: 'red',//线的颜色
        weight: 3 //线的粗细

    }).addTo(xiangroup);

}
function function_draw_line() {
    let inputstr = prompt("输入经纬度：");
    if (inputstr) {
        j = JSON.parse(inputstr);
        for (let i = 0; i < j.length; i++) {
            [j[i][0], j[i][1]] = [j[i][1], j[i][0]];
        }
        len = j.length;
        for (let i = 1; i < j.length; i++) {
            while (j[i][1] - j[i - 1][1] > 180)
                j[i][1] = j[i][1] - 360;
            while (j[i - 1][1] - j[i][1] > 180)
                j[i][1] = j[i][1] + 360;
        }




        polyline.setLatLngs(j)
        map.fitBounds(polyline.getBounds());
    }
};
const zoomendforcoordinatesHandler = e => {//左下角经纬度变化
    let scale = e.target.getZoom();
    let co = document.getElementById('mapCoordDIV').innerHTML.split(":")[2];
    document.getElementById('mapCoordDIV').innerHTML = 'level:' + scale + ' Coordinates: ' + co;
    uploadline();//一旦放缩就显示航线
    // if(!flag)
    // {
    //     uploadline();//显示航线
    // }
    // flag=false;//缩放一下再为假
};
map.on('zoomend', zoomendforcoordinatesHandler);

const mousemoveforcoordinatesHandler = e => {//左下角经纬度变化
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;
    let scale = e.target.getZoom();
    while (lng > 180)
        lng = lng - 360;
    while (lng < -180)
        lng = lng + 360;
    lng = lng.toFixed(5)
    lat = lat.toFixed(5)
    document.getElementById('mapCoordDIV').innerHTML = 'level:' + scale + ' Coordinates: ' + lng + '   ,   ' + lat;
    
};
map.on('mousemove', mousemoveforcoordinatesHandler);

let path=[];//存放航线的坐标；
//let pathlist = [];//定义一个航道数组，存储各个航道的数据，里面就是第一条航道，第二条航道。。。

let drawing = false;
function addpath() {
    // 避免多次drawing
    if (drawing) {
        return
    }

    // interactive = false 避免用户双击map无效
    const layer = L.polyline([], {
        interactive: false,
        dashArray: '4 4',
    }).addTo(map);
    //layer = layer;
    
    // 绘制mousemove line
    const tempLayer = L.polyline([], {
        interactive: false,
        dashArray: '4 4',
    }).addTo(map);
    let tempPoints = [];//存放航线坐标点的数组；
    let points=[];//我设的
    
    // popup 展示距离
    const popup = L.popup({
        autoClose: false,
        closeButton: false
    });

    const clickHandler = e => {
        layer.addLatLng(e.latlng);
        tempPoints[0] = e.latlng;
        drawing = true
        map.doubleClickZoom.disable()

        const len = turf.length(layer.toGeoJSON(), { units: "kilometers" });

        popup
            .setLatLng(e.latlng)
            .setContent((len.toFixed(2) + " 公里"))
            .openOn(map);
        
        console.log(e.latlng.lat, e.latlng.lng);
        points.push([e.latlng.lat, e.latlng.lng]);
        path =points;//传出去给全局变量JSON.stringify(tempPoints)
        //console.log(path);//路径点没问题了
        //pathlist += JSON.stringify(path);//添加之后就应该清空，放在这他会重复传前几次的值；
        //path =null;
        //console.log(pathlist);
        //path=[null];
    };

    
    const mousemoveHandler = e => {
        if (tempPoints.length) {
            tempPoints[1] = e.latlng;
            tempLayer.setLatLngs(tempPoints);
            
        }
        
    };

    // 双击结束， 移除事件是良好的编程习惯
    const dblclickHandler = e => {
        // popup 展示距离
        // const popup = L.popup({
        //     minWidth: 0,
        //     maxWidth: 0,
        //     autoClose: false,
        //     closeButton: true,
        //     closeOnClick: false,
        // });
        // popup.on('remove', (e) => {
        //     tempLayer.remove();//点×去除航线
        //     layer.remove();
        //     deleteline(delid);//删除航道
        // });

        Saveline();//双击保存航道。   let delid=
        //console.log("delid=",delid);
        tempPoints = null;

        drawing = false
        //双击直接就消失
            tempLayer.remove();//点×去除航线
            layer.remove();
        //叉叉弹窗先注释
        // popup
        //     .setLatLng(e.latlng)
        //     //.setContent(setTipText(len.toFixed(2) + " 公里"))
        //     //.setContent((len.toFixed(2) + " 公里"))
        //     .setContent()
        //     .openOn(map);


        map.off("click", clickHandler);
        map.off("mousemove", mousemoveHandler);
        map.off("dblclick", dblclickHandler);
        //map.on('dblclick', dbclickforpilotHandler);

    };

    map.on("click", clickHandler);
    map.on("mousemove", mousemoveHandler);
    map.on("dblclick", dblclickHandler);
    //map.off('dblclick', dbclickforpilotHandler);
    

}
//let flag=false;//定义一个标志位，当他为真，代表目前目前添加航道了/保存航道了，就是有蓝色线了，不用在加载红色航线
//保存航道
function Saveline(){
    //flag=true;//保存了标志位就变为true
    console.log("path============");
    console.log(path);
    const http = new XMLHttpRequest();
    console.log(path.length);
    let idnum=path.length;
    let did=0;//定义变量将保存的编号传给delid
    let geturl = `http://58.215.121.58:3002?path=${path}&idnum=${idnum}`;//localhost:3002
    console.log(geturl);//http://58.215.121.58:3002?inner_id=    maxid=${maxid}&
    http.open("GET", geturl);
    http.send();

    console.log("第一个保存状态码：",http.readyState);
    http.onreadystatechange=function(){
        if(http.readyState==4){
            if(http.status==200){
                console.log(http.response);//看一下是否响应成功MAX(path_id)
                maxid=JSON.parse(http.response);//parse
                maxid=maxid[0]['MAX(path_id)'];
                //console.log(maxid);//maxid[0]['MAX(path_id)']
                console.log("maxid=========之前数据库里的最大id是===============",maxid);
                console.log("保存成功！!");
                
                // if(maxid==null)
                // {
                //     prepath.push(1);
                //     did=1;
                //     return did;
                // }
                // else{
                //     prepath.push((maxid+1));
                //     did=maxid+1;
                //     console.log("保存-----------prepath:",prepath);
                //     //return did;
                // }
                
                // console.log("保存prepath:",prepath);
                
            }
        }
        //return did;
    }//第一次maxid为空如何考虑
    //必须写外面，否则函数返回值为空，delid没定义
    return did;//设置一个返回值传给删除函数，保存哪条就删除哪条
    
}
let prepath0=[];//需要两个，去重
let prepath=[];//定义一个数组记录之前加载过哪些线，如果之前加载过就不重复加载
//加载航道
function uploadline(e){
    //scale = e.target.getZoom();
    
    //if (scale > 7) {
    const http = new XMLHttpRequest();//创建对象
    //flag=false;//调用加载标志位又为假。
    let path=[];//定义加载航道的路径点
    
        var left = map.getBounds().getWest();//._northEast.lat;     this.
        var right = map.getBounds().getEast();
        var down = map.getBounds().getSouth();//取得当前窗口的经纬度
        var up = map.getBounds().getNorth();
        //此处也要加经度加减360
        while (left > 180)
            left = left - 360;
        while (left < -180)
            left = left + 360;
        //把左右边界的经度都限制在正负180之间。
        while (right > 180)
            right = right - 360;
        while (right < -180)
            right = right + 360;
        
        let geturl = "http://58.215.121.58:3003?lat=" +(down)+"&late="+(up)+"&lons="+(left)+"&lone="+(right);//path
        console.log(geturl);//58.215.121.58

        http.open("GET", geturl);
        http.send();
        
        let pid=1;//记录加载哪条线,初始值为1，后面如果当前窗口没有航线也会显示加载1
        console.log("第一个加载状态码：",http.readyState);
            http.onreadystatechange=function(){
                if(http.readyState==4){
                    if(http.status==200){
                        console.log(http.response);//看一下是否响应成功

                        let obj=JSON.parse(http.response);//这边是查的path_id,并不是路线！！！！
                        //console.log(obj);

                        //加个判断，如果当前界面不止一条，判断第一条是否加载过，加载过就往后
                        if(obj.length>1)
                        {
                            for(let i=0;i<obj.length;++i)
                            {
                                let pid01=obj[i]["path_id"];
                                // while(prepath.includes(pid01))
                                // {
                                //     pid01=obj[i+1]["path_id"];
                                    
                                // }//写while容易死循环
                                // if(prepath.includes(pid01))
                                // {
                                //     pid01=obj[i+1]["path_id"];
                                //     //pid=pid01;
                                //     //break;
                                // }
                                // else{
                                //     pid=pid01;
                                //     break;
                                // }
                                if(!prepath.includes(pid01))
                                {
                                    pid=pid01;
                                    break;
                                }
                                    

                            }
                        }
                        else{//长度小于等于1，也就是当前窗口只有一条航线或没有的情况
                        let pid00=obj[0]["path_id"];//把path_id拿出来
                        
                        pid=pid00;
                        }
                        console.log("pathid==========加载==================================",pid);
                        //if不能写这，一定要发送http请求，否则没法删除
                        
                        let geturl2 = "http://58.215.121.58:3005?path_id="+pid;
                        console.log(geturl2);// 58.215.121.58
                        
                        console.log("prepath:",prepath);
                        http.open("GET", geturl2);
                        http.send();
                        
                        http.onreadystatechange=function(){
                            if(http.readyState==4){
                                if(http.status==200){
                                    //console.log(http.response);//看一下是否响应成功
                                    let hangdao=JSON.parse(http.response);
                                    console.log("航道数据==",hangdao);
                                    console.log("未加载过当前航道：",!prepath.includes(pid));

                                    if(!prepath.includes(pid)){
                                        //如果prepath里面不包括当前要加载的航道就加载，已经加载过得就别重复加载了
                                    
                                        for(let i=0;i<hangdao.length;++i)
                                        {
                                            //这边加个判断，如果过边界了，经度就不用转换，超过180就超过
                                            if(hangdao[i].lng<0)
                                            {
                                                hangdao[i].lng=hangdao[i].lng+360;
                                            }
                                            path.push([hangdao[i].lat,hangdao[i].lng]);
                                            

                                        }//注意：纬度在前，经度在后
                                        console.log("path:",path);

                                        prepath0.push(pid);//把当前加载的pid赋值给之前的prepath
                                        for(let i=0;i<prepath0.length;++i)
                                        {
                                            let ele=prepath0[i];
                                            if(prepath.indexOf(ele)==-1){
                                                prepath.push(ele);//
                                            }
                                        }//不重复添加
                                        //prepath括号包在这，底下弹窗就重复添加；包住整个，点删除没有用

                                        //let polyline之前把let去了变成了全局变量 改名字了
                                        let polyline2 = L.polyline(path, {color: 'red'}).addTo(map);
                                        console.log("第二个加载状态码：",http.readyState);
                                        // zoom the map to the polyline
                                        //map.fitBounds(polyline.getBounds());
                                        console.log("加载成功！！");
                                    
                                        let last=hangdao.length-1;
                                                                        
                                        //点叉叉删除 const popup2
                                        const popup2 = L.popup({
                                            minWidth: 20,
                                            maxWidth: 50,
                                            autoClose: false,
                                            closeButton: true,
                                            closeOnClick: false,
                                        });
                                        popup2.on('remove', () => {
                                            //点叉叉删除航线
                                            //tempLayer.remove();//点×去除航线，同时删除蓝色线
                                            //layer.remove();
                                            polyline2.remove();
                                            deleteline(pid);//删除航道
                                            prepath.splice(prepath.indexOf(pid),1);//删除该航线时把prepath里编号也删除
                                            prepath0.splice(prepath0.indexOf(pid),1);
                                            console.log("删除后 prepath0为",prepath);
                                            console.log("删除后prepath为",prepath);
                                        });//放外面没定义
                                        //把弹窗添加到地图上,把它放外面，删除估计就有效了
                                        popup2
                                            .setLatLng([hangdao[last].lat,hangdao[last].lng])
                                            .setContent("删除")
                                            .openOn(map);
                                    
                                    }//这是if的大括号
                                }
                                
                            }
                        }
                        
                    
                }
            }
        }
    //}
        
}

//删除航道
function deleteline(deleteid){
    const http = new XMLHttpRequest();
    
        // var left = map.getBounds().getWest();//._northEast.lat;  this.
        // var right = map.getBounds().getEast();
        // var down = map.getBounds().getSouth();
        // var up = map.getBounds().getNorth();
    
        //let geturl = "http://58.215.121.58:3004?lat="+(down)+"&late="+(up)+"&lons="+(left)+"&lone="+(right);//path
        let geturl = "http://58.215.121.58:3004?deleteid="+(deleteid);
        console.log(geturl);//http://58.215.121.58

        http.open("GET", geturl);
        http.send();

        console.log("第一个删除状态码：",http.readyState);
            http.onreadystatechange=function(){
                if(http.readyState==4){
                    if(http.status==200){
                        console.log(http.response);//看一下是否响应成功,http.response应该是字符串格式
                        console.log("删除成功！！");
                    }
                }
            }
    
}