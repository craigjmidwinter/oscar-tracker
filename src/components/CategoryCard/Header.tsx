export function CategoryCardHeader(props: { name: string, watched: number, total: number, progress: number }) {
    return <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg font-semibold text-gray-800 whitespace-normal">
            {props.name}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                {props.watched}/{props.total}
                            </span>
            <div className="w-16 h-2 bg-gray-100 rounded-full">
                <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{width: `${props.progress}%`}}
                />
            </div>
        </div>
    </div>;
}