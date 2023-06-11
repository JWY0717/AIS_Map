import proto from './protoRollUp'

export default function decodeAISData(data) {
    let buf = new Uint8Array(data).buffer;
    if (buf.byteLength > 60) {
        const array1 = buf.slice(0, 4);
        let dateSize = new Uint32Array(array1)[0];
        const array3 = buf.slice(8, dateSize + 8);
        let realData = new Uint8Array(array3);
        return proto.web_gis.AIS_BASE.decode(realData);
    }
}