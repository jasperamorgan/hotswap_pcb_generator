const kle = require("@ijprest/kle-serial");
const fs = require('fs')
const util = require('util')


var kle_filename = process.argv[2] ?? 'layout.json';
var output_filename = process.argv[3] ?? '../layout.scad';

try {
    var kle_json = fs.readFileSync(kle_filename, 'UTF-8');
} catch (err) {
    console.error(err);
}

var keyboard = kle.Serial.parse(kle_json);

var formatted_keys = keyboard.keys.map(
    key =>
        [
            [
                [key.x, key.y],
                [-key.rotation_angle, key.rotation_x, key.rotation_y]
            ],
            [
                key.width,
                [
                    1,
                    1,
                    "1+" + ((key.width-1)/2).toString() + "*unit*mm",
                    "1+" + ((key.width-1)/2).toString() + "*unit*mm"
                ],
                false
            ]
        ]
)

var file_content =
`include <parameters.scad>

/* [Layout Values] */
/* Layout Format (each key):
    [
        [
            [x_location, y_location],
            [rotation, rotation_x, rotation_y]
        ],
        [
            key_size,
            [top_border, bottom_border, left_border, right_border],
            rotate_column
        ]
    ]
*/
// Keyswitch Layout
`
file_content += formatted_keys.reduce(
    (total, key) => total + "  " + JSON.stringify(key).replace(/"/g, "") + ",\n",
    "base_layout = [\n"
);
file_content +=
`];

// Standoff hole layout
base_standoff_layout = [];

// Whether to flip the layout
invert_layout_flag = false;

// Whether the layout is staggered-row or staggered-column
layout_type = "column";  // [column, row]

// Standoff configuration
standoff_type = "plate"; // [plate, pcb, separate, none]
`;

try {
    const data = fs.writeFileSync(output_filename, file_content);
} catch (err) {
    console.error(err);
}
