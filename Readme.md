# 版本控制中心

## diff.json

    {
        diff: [
            '- dir git-test/xx/dir/',   // delete dir
            '- file git-test/xx/file',  // delete file
            '+ dir git-test/xx/dir/',   // add dir
            '+ file git-test/xx/file',  // add file
            'm dir git-test/xx/dir/',   // modify dir
            'm file git-test/xx/file',  // modify file
        ]
    }

## todo
* 再次checkout的话会报错,由于删除了.git文件造成的,需要remove掉new-code文件夹
* 并发时的竞争
* 缓存diff生成的增量包和描述文件
* 没有old version只有new version