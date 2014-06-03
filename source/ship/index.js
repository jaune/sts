(function () {

    const MARK_HAS_FLOOR = 1;
    const MARK_HAS_DOOR = 1 << 1;
    const MARK_IS_OPEN = 1 << 2;

    var tile_h = 25;
    var tile_w = 25;

    var h = 20;
    var w = 20;
    var l = w * h;

    var buffer = new ArrayBuffer(l * Uint8Array.BYTES_PER_ELEMENT);
    var view = new DataView(buffer);

    var i, mask;

    for (i = 0; i < l; i++) {
        mask = 0;

        if (Math.round(Math.random()) == 1) {
            mask |= MARK_HAS_FLOOR;
        }
        if (Math.round(Math.random() * 50) == 1) {
            mask |= MARK_HAS_DOOR;
        }
//        mask &= MARK_IS_OPEN;

        view.setUint8(i, mask);
    }


    var stage = new Kinetic.Stage({
        container: 'kinetic-container',
        width: 500,
        height: 500
    });

    var layerCells = new Kinetic.Layer();
    var layerDoors = new Kinetic.Layer();

    var x, y, cell, flags;

    for (i = 0; i < l; i++) {
        x = i % w;
        y = (i - x) / w;
        flags = view.getUint8(i);



        if (flags !== 0) {

            cell = new Kinetic.Rect({
                x: x * tile_w,
                y: y * tile_h,
                width: tile_w,
                height: tile_h,
                fill: '#f0f',
                stroke: null,
                strokeWidth: 0
            });

            layerCells.add(cell);
        }

        // console.debug(flags && MARK_HAS_DOOR);

        if ((flags & MARK_HAS_DOOR) === MARK_HAS_DOOR) {

            cell = new Kinetic.Rect({
                x: x * tile_w,
                y: y * tile_h,
                width: tile_w,
                height: tile_h,
                fill: '#f00',
                stroke: null
            });

            cell.on('click', (function (x, y, i) {
                var me = this;

                var flags = view.getUint8(i);

                if ((flags & MARK_IS_OPEN) == MARK_IS_OPEN) {
                    me.fill('#f00');
                    view.setUint8(i, flags ^ MARK_IS_OPEN);

                    (new Kinetic.Tween({
                        node: me,
                        height: tile_h,
                        duration: 1,
                        easing: Kinetic.Easings.EaseInOut
                    })).play();

                } else {

                    (new Kinetic.Tween({
                        node: me,
                        height: 5,
                        duration: 1,
                        easing: Kinetic.Easings.EaseInOut,
                        onFinish: function () {
                            me.fill('#0f0');
                            view.setUint8(i, flags | MARK_IS_OPEN);
                        }
                    })).play();

                }

                layerDoors.draw();

            }).bind(cell, x, y, i));

            layerDoors.add(cell);
        }

    }
    stage.add(layerCells);
    stage.add(layerDoors);

})();