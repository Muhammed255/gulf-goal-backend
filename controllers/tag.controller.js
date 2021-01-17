import Tag from "../models/tag.model.js";

export default {
  async addNewTag(req, res, next) {
    try {
      const newTag = new Tag();
      newTag.tag = req.body.tag;
      newTag.userId = req.userData.userId;

      await newTag.save();
      res
        .status(200)
        .json({ success: true, msg: "Tag created successfully!", tag: newTag });
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
      await Tag.findByIdAndUpdate(
        req.params.tagId,
        { $inc: { visits: 1 } },
        { new: true }
      );
      res.status(200).json({ success: true, msg: "fetched", tag: tagToFind });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getAllTags(req, res, next) {
    try {
      const tags = await Tag.find().populate("userId");
      res.status(200).json({ success: true, msg: "tags fetched", tags });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getPopularTags(req, res, next) {
    try {
      const tags = await Tag.find().sort({visits: -1}).limit(8);
      res.status(200).json({ success: true, msg: "tags fetched", tags });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async countTags(req, res, next) {
    try {
      const count = await Tag.estimatedDocumentCount();
      res.status(200).json({ count: count });
    } catch (err) {
      res.status(500).json({ err });
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
        { _id: tagToUpdate._id, userId: req.userData.userId },
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
        userId: req.userData.userId,
      });
      res.status(200).json({ success: true, msg: "deleted" });
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },
};
