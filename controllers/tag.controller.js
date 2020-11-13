import Tag from "../models/tag.model";

export default {
  async addNewTag(req, res, next) {
    try {
      const { tag } = req.body;
      const newTag = new Tag();
      newTag.tag = tag;

      await newTag.save();
      res.status(200).json({ success: true, msg: "Tag created successfully!" });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async findOneTag(req, res, next) {
    try {
      const tagToFind = await Tag.findById(req.params.tagId);
      if (!tagToFind) {
        return res
          .status(401)
          .json({ success: false, msg: "Can not find tag" });
      }
      res.status(200).json({ success: true, msg: "fetched", tag: tagToFind });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getAllTags(req, res, next) {
    try {
      const tags = await Tag.find();
      res.status(200).json({ success: true, msg: "tags fetched", tags });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async updateTag(req, res, next) {
    try {
      const { tag } = req.body;
      const tagToUpdate = await Tag.findById(req.params.tagId);
      if (!tagToUpdate) {
        return res
          .status(401)
          .json({ success: false, msg: "Can not find tag" });
      }

      await Tag.findOneAndUpdate(
        { _id: tagToUpdate._id, userId: req.userData._id },
        { tag },
        { new: true }
      );
      res.status(200).json({ success: true, msg: "updated" });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async deleteTag(req, res, next) {
    try {
      const tagToDelete = await Tag.findById(req.params.tagId);
      if (!tagToDelete) {
        return res
          .status(401)
          .json({ success: false, msg: "Can not find tag" });
      }

      await Tag.findOneAndDelete({
        _id: tagToDelete._id,
        userId: req.userData._id,
      });
      res.status(200).json({success: true, msg: "deleted"})
    } catch (err) {
        res.status(500).json({success: false, msg: err})
    }
  },
};
