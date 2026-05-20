import {TAGS} from "../model/data.ts";

export default function DevicesTags() {
    return (
        <div className="devices-tags">
            {TAGS.map((tag) => {
                const Icon = tag.icon;

                return (
                    <div key={tag.text} className="devices-tags__chip">
                        <Icon size={18}
                              strokeWidth={1.5}
                              className="devices-tags__chip-icon"
                        />
                        {tag.text}
                    </div>
                );
            })}
        </div>
    );
}