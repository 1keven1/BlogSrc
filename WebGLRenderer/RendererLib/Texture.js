'use strict'
class Texture {
    /**
     * 贴图文件 会自动绑定到Texture Unit
     * @constructor
     * @param {String} texFile 贴图文件路径
     * @param {GLenum} texType 贴图类型
     */
    constructor(texFile, texType = gl.TEXTURE_2D, texFormat = gl.RGBA) {
        this.texFile = texFile;
        this.texType = texType;
        this.texFormat = texFormat;

        this.bGenerateMipmap = true;
        this.wrapModeS = gl.REPEAT;
        this.wrapModeT = gl.REPEAT;

        this.width = -1;
        this.height = -1;
        this.texIndex = null;
        this.texUnit = null;

        this.texture = null;
        this.bLoaded = false;
    }

    load(texIndex) {
        this.texIndex = texIndex;
        this.texUnit = gl.TEXTURE0 + texIndex;

        // 创建Texture
        let texture = gl.createTexture();
        if (!texture) {
            console.error(this.texFile + '：创建Texture失败');
        }

        switch (this.texType) {
            case gl.TEXTURE_2D:
                // 创建Image
                let image = new Image();

                image.onload = () => {
                    this.width = image.width;
                    this.height = image.height;

                    // 因为WebGL只支持2的整数次幂宽高的图像，所以先做判断
                    if (!isPowerOf2(this.height) || !isPowerOf2(this.width)) {
                        console.error('图片' + this.texFile + '宽高不是2的整数次幂');
                        return;
                    }

                    // 写入图像数据
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                    gl.activeTexture(this.texUnit);
                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    switch (this.texFormat) {
                        case gl.RGBA:
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                            break;
                        case gl.RGBA16F:
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, gl.RGBA, gl.FLOAT, image);
                            break;
                        default:
                            console.log('图片' + this.texFile + ' Format不正确：' + this.texFormat);
                            return;
                    }

                    // 其他设置
                    // 是否生成MipMap
                    if (this.bGenerateMipmap) {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.generateMipmap(gl.TEXTURE_2D);
                    }
                    else {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    }
                    // Wrap Mode
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapModeS);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapModeT);
                    this.texture = texture;

                    this.bLoaded = true;
                    this.loadOver();
                };
                image.src = this.texFile;

                break;

            case gl.TEXTURE_CUBE_MAP:
                // 创建一群Image
                let paths = ["/Lod0_PosX.jpg", "/Lod0_NegX.jpg", "/Lod0_PosY.jpg", "/Lod0_NegY.jpg", "/Lod0_PosZ.jpg", "/Lod0_NegZ.jpg"];
                let targets = [
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ]
                let images = [null, null, null, null, null, null];

                // 逐个加载
                paths.forEach((path, index, arr) => {
                    let image = new Image();
                    image.onload = () => {
                        this.width = image.width;
                        this.height = image.height;

                        // 因为WebGL只支持2的整数次幂宽高的图像，所以先做判断
                        if (!isPowerOf2(this.height) || !isPowerOf2(this.width)) {
                            console.error('图片' + this.texFile + '宽高不是2的整数次幂');
                            return;
                        }
                        images[index] = image;

                        // 如果都加载完了
                        if (images[0] && images[1] && images[2] && images[3] && images[4] && images[5]) {
                            // 写入图像数据
                            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
                            gl.activeTexture(this.texUnit);
                            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

                            targets.forEach((target, index, arr) => {
                                switch (this.texFormat) {
                                    case gl.RGBA:
                                        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
                                        break;
                                    case gl.RGBA16F:
                                        gl.texImage2D(target, 0, gl.RGBA16F, gl.RGBA, gl.FLOAT, images[index]);
                                        break;
                                    default:
                                        console.log('图片' + this.texFile + ' Format不正确：' + this.texFormat);
                                        return;
                                }
                            })
                            // 其他设置
                            // 是否生成MipMap
                            if (this.bGenerateMipmap) {
                                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                            }
                            else {
                                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                            }
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapModeS);
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapModeT);
                            this.texture = texture;

                            this.bLoaded = true;
                            this.loadOver();
                        }
                    }
                    image.src = this.texFile + path;
                })
                break;
            default:
                console.error(this.texFile + '：无效Texture Type');
                return;
        }
    }

    loadOver() { }

    setWrapMode(wrapMode){
        this.wrapModeS = wrapMode;
        this.wrapModeT = wrapMode;
    }
}

class AmbientCubemap extends Texture {
    /**
     * 供PBR使用的环境贴图 Lod0-Lod6
     * @param {string} texFile 文件路径
     */
    constructor(texFile) {
        super(texFile, gl.TEXTURE_CUBE_MAP, gl.RGBA);
        this.mipLoadState = [false, false, false, false, false];
    }

    load(texIndex) {
        this.texIndex = texIndex;
        this.texUnit = gl.TEXTURE0 + texIndex;

        // 创建Texture
        let texture = gl.createTexture();
        if (!texture) {
            console.error(this.texFile + '：创建Texture失败');
        }

        let paths = ["_PosX.jpg", "_NegX.jpg", "_PosY.jpg", "_NegY.jpg", "_PosZ.jpg", "_NegZ.jpg"];
        let targets = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ]
        let images = [null, null, null, null, null, null];
        // 加载Lod0
        paths.forEach((path, index, arr) => {
            let image = new Image();
            image.onload = () => {
                this.width = image.width;
                this.height = image.height;

                // 因为WebGL只支持2的整数次幂宽高的图像，所以先做判断
                if (!isPowerOf2(this.height) || !isPowerOf2(this.width)) {
                    console.error('图片' + this.texFile + '宽高不是2的整数次幂');
                    return;
                }
                images[index] = image;

                // 如果都加载完了
                if (images[0] && images[1] && images[2] && images[3] && images[4] && images[5]) {
                    // 写入图像数据
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
                    gl.activeTexture(this.texUnit);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

                    targets.forEach((target, index, arr) => {
                        switch (this.texFormat) {
                            case gl.RGBA:
                                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
                                break;
                            case gl.RGBA16F:
                                gl.texImage2D(target, 0, gl.RGBA16F, gl.RGBA, gl.FLOAT, images[index]);
                                break;
                            default:
                                console.log('图片' + this.texFile + ' Format不正确：' + this.texFormat);
                                return;
                        }
                    })

                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    this.texture = texture;

                    // 加载其他lod级别作为MipMap
                    for (let i = 1; i <= 6; i++) {
                        this.loadMip(i, paths, targets);
                    }
                }
            }
            image.src = this.texFile + '/Lod0' + path;
        })
    }

    loadMip(mipLevel, paths, targets) {
        let images = [null, null, null, null, null, null];
        // 逐个加载面片
        paths.forEach((path, index, arr) => {
            let image = new Image();
            image.onload = () => {
                this.width = image.width;
                this.height = image.height;

                // 因为WebGL只支持2的整数次幂宽高的图像，所以先做判断
                if (!isPowerOf2(this.height) || !isPowerOf2(this.width)) {
                    console.error('图片' + this.texFile + '宽高不是2的整数次幂');
                    return;
                }
                images[index] = image;

                if (images[0] && images[1] && images[2] && images[3] && images[4] && images[5]){
                    // 写入图像数据
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
                    gl.activeTexture(this.texUnit);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

                    targets.forEach((target, index, arr) => {
                        switch (this.texFormat) {
                            case gl.RGBA:
                                gl.texImage2D(target, mipLevel, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
                                break;
                            case gl.RGBA16F:
                                gl.texImage2D(target, mipLevel, gl.RGBA16F, gl.RGBA, gl.FLOAT, images[index]);
                                break;
                            default:
                                console.log('图片' + this.texFile + ' Format不正确：' + this.texFormat);
                                return;
                        }
                    })
                    // 该mip已经加载完毕
                    this.mipLoadState[mipLevel - 1] = true;
                    // 检查是否都加载完毕
                    this.checkIfLoadOver();
                }
            }
            image.src = this.texFile + '/Lod' + mipLevel + path;
        })
    }

    checkIfLoadOver(){
        if (this.mipLoadState[0] && this.mipLoadState[1] && this.mipLoadState[2] && this.mipLoadState[3] && this.mipLoadState[4]){
            this.bLoaded = true;
            this.loadOver();
        }
    }

    loadOver() { }
}