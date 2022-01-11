function main()
{
    // 取得canvas组件
    var canvas = document.getElementById('example');
    if(!canvas)
    {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // 向canvas请求2D“绘制上下文”
    var ctx = canvas.getContext('2d');

    // 在绘制上下文上调用绘图函数
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'; // rgb从0-255，A从0.0-1.0
    ctx.fillRect(120, 10, 150, 150); // Point1X, Point1Y, Point2X, Point2Y
}